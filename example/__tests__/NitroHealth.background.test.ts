import { mockNitroHealth } from './support/mockNitroHealth'

jest.mock('react-native-nitro-modules', () => ({
  NitroModules: {
    createHybridObject: jest.fn(() => mockNitroHealth),
  },
}))

import { NitroHealth } from 'react-native-nitro-health'
import type { ListenerSubscription } from 'react-native-nitro-health'

describe('NitroHealth background contract', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockNitroHealth.getAvailability.mockReturnValue({ status: 'available' })
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('configures observer delivery and deduplicates data types', async () => {
    mockNitroHealth.configureBackgroundChanges.mockResolvedValue({
      status: 'completed',
      mode: 'observer',
      backgroundRead: 'included',
    })

    await expect(
      NitroHealth.configureBackgroundChanges({
        dataTypes: ['steps', 'steps', 'sleep'],
        frequency: 'hourly',
      })
    ).resolves.toEqual({ status: 'completed', mode: 'observer' })

    expect(mockNitroHealth.configureBackgroundChanges).toHaveBeenCalledWith(
      ['steps', 'sleep'],
      'hourly'
    )
  })

  it('maps app-owned polling configuration and targeted disable results', async () => {
    mockNitroHealth.configureBackgroundChanges.mockResolvedValue({
      status: 'userActionRequired',
      mode: 'polling',
      backgroundRead: 'notGranted',
    })
    mockNitroHealth.disableBackgroundChanges.mockResolvedValue({
      status: 'userActionRequired',
      mode: 'polling',
      backgroundRead: 'notDeclared',
    })

    await expect(
      NitroHealth.configureBackgroundChanges({ dataTypes: ['steps'], frequency: 'daily' })
    ).resolves.toEqual({
      status: 'user-action-required',
      mode: 'polling',
      scheduling: 'app-owned',
      backgroundRead: 'not-granted',
    })
    await expect(
      NitroHealth.disableBackgroundChanges(['steps', 'steps', 'distance'])
    ).resolves.toEqual({
      status: 'user-action-required',
      mode: 'polling',
      scheduling: 'app-owned',
      backgroundRead: 'not-declared',
    })

    expect(mockNitroHealth.disableBackgroundChanges).toHaveBeenCalledWith([
      'steps',
      'distance',
    ])
  })

  it('disables every configured data type when no list is supplied', async () => {
    mockNitroHealth.disableBackgroundChanges.mockResolvedValue({
      status: 'completed',
      mode: 'observer',
      backgroundRead: 'included',
    })

    await expect(NitroHealth.disableBackgroundChanges()).resolves.toEqual({
      status: 'completed',
      mode: 'observer',
    })
    expect(mockNitroHealth.disableBackgroundChanges).toHaveBeenCalledWith(undefined)
  })

  it('surfaces unavailable background configuration', async () => {
    mockNitroHealth.configureBackgroundChanges.mockResolvedValue({
      status: 'unavailable',
      mode: 'polling',
      backgroundRead: 'unsupported',
    })

    await expect(
      NitroHealth.configureBackgroundChanges({ dataTypes: ['steps'], frequency: 'weekly' })
    ).resolves.toEqual({ status: 'unavailable' })
  })

  it('validates background configuration before crossing native', async () => {
    await expect(
      NitroHealth.configureBackgroundChanges({ dataTypes: [], frequency: 'immediate' })
    ).rejects.toThrow('At least one background change data type is required')
    await expect(NitroHealth.disableBackgroundChanges([])).rejects.toThrow(
      'dataTypes must be omitted or contain at least one health data type'
    )

    expect(mockNitroHealth.configureBackgroundChanges).not.toHaveBeenCalled()
    expect(mockNitroHealth.disableBackgroundChanges).not.toHaveBeenCalled()
  })

  it('returns app-owned polling without installing a native listener', () => {
    mockNitroHealth.getBackgroundChangesMode.mockReturnValue('polling')

    expect(NitroHealth.subscribeToBackgroundChanges(jest.fn())).toEqual({
      mode: 'polling',
      scheduling: 'app-owned',
    })
    expect(mockNitroHealth.setOnBackgroundChangeListener).not.toHaveBeenCalled()
  })

  it('multiplexes observer listeners through one acknowledged native callback', () => {
    mockNitroHealth.getBackgroundChangesMode.mockReturnValue('observer')
    mockNitroHealth.setOnBackgroundChangeListener.mockReturnValue(true)
    mockNitroHealth.acknowledgeBackgroundChange.mockReturnValue(true)
    const firstListener = jest.fn()
    const secondListener = jest.fn()
    const firstResult = NitroHealth.subscribeToBackgroundChanges(firstListener)
    const secondResult = NitroHealth.subscribeToBackgroundChanges(secondListener)

    if (firstResult.mode !== 'observer' || secondResult.mode !== 'observer') {
      throw new Error('Expected observer subscriptions')
    }

    expect(mockNitroHealth.setOnBackgroundChangeListener).toHaveBeenCalledTimes(1)
    const nativeListener = mockNitroHealth.setOnBackgroundChangeListener.mock.calls[0]?.[0]
    expect(nativeListener).toEqual(expect.any(Function))

    nativeListener?.(['steps', 'steps', 'sleep'], 'delivery-1')

    const expectedNotification = { dataTypes: ['steps', 'sleep'] }
    expect(firstListener).toHaveBeenCalledWith(expectedNotification)
    expect(secondListener).toHaveBeenCalledWith(expectedNotification)
    expect(mockNitroHealth.acknowledgeBackgroundChange).toHaveBeenCalledWith('delivery-1')

    firstResult.subscription.remove()
    expect(mockNitroHealth.setOnBackgroundChangeListener).toHaveBeenCalledTimes(1)
    secondResult.subscription.remove()
    secondResult.subscription.remove()
    expect(mockNitroHealth.setOnBackgroundChangeListener).toHaveBeenLastCalledWith(undefined)
  })

  it('acknowledges before detaching a self-removing final observer listener', () => {
    mockNitroHealth.getBackgroundChangesMode.mockReturnValue('observer')
    mockNitroHealth.setOnBackgroundChangeListener.mockReturnValue(true)
    mockNitroHealth.acknowledgeBackgroundChange.mockReturnValue(true)
    let subscription: ListenerSubscription | undefined
    const listener = jest.fn(() => subscription?.remove())
    const result = NitroHealth.subscribeToBackgroundChanges(listener)
    if (result.mode !== 'observer') throw new Error('Expected an observer subscription')
    subscription = result.subscription
    const nativeListener = mockNitroHealth.setOnBackgroundChangeListener.mock.calls[0]?.[0]

    nativeListener?.(['steps'], 'delivery-2')

    expect(mockNitroHealth.acknowledgeBackgroundChange).toHaveBeenCalledWith('delivery-2')
    expect(mockNitroHealth.setOnBackgroundChangeListener).toHaveBeenLastCalledWith(undefined)
    const acknowledgeOrder =
      mockNitroHealth.acknowledgeBackgroundChange.mock.invocationCallOrder[0] ?? 0
    const detachOrder =
      mockNitroHealth.setOnBackgroundChangeListener.mock.invocationCallOrder[1] ?? 0
    expect(acknowledgeOrder).toBeLessThan(detachOrder)
  })

  it('surfaces a failed native delivery acknowledgement', () => {
    mockNitroHealth.getBackgroundChangesMode.mockReturnValue('observer')
    mockNitroHealth.setOnBackgroundChangeListener.mockReturnValue(true)
    mockNitroHealth.acknowledgeBackgroundChange.mockReturnValue(false)
    const listener = jest.fn()
    const result = NitroHealth.subscribeToBackgroundChanges(listener)
    if (result.mode !== 'observer') throw new Error('Expected an observer subscription')
    const nativeListener = mockNitroHealth.setOnBackgroundChangeListener.mock.calls[0]?.[0]

    expect(() => nativeListener?.(['steps'], 'delivery-unacknowledged')).toThrow(
      'Native observer did not acknowledge its background change delivery'
    )
    expect(listener).toHaveBeenCalledWith({ dataTypes: ['steps'] })
    expect(mockNitroHealth.acknowledgeBackgroundChange).toHaveBeenCalledWith(
      'delivery-unacknowledged'
    )

    result.subscription.remove()
  })

  it('acknowledges delivery before surfacing a listener error asynchronously', () => {
    jest.useFakeTimers()
    mockNitroHealth.getBackgroundChangesMode.mockReturnValue('observer')
    mockNitroHealth.setOnBackgroundChangeListener.mockReturnValue(true)
    mockNitroHealth.acknowledgeBackgroundChange.mockReturnValue(true)
    const listenerError = new Error('listener failed')
    const result = NitroHealth.subscribeToBackgroundChanges(() => {
      throw listenerError
    })
    if (result.mode !== 'observer') throw new Error('Expected an observer subscription')
    const nativeListener = mockNitroHealth.setOnBackgroundChangeListener.mock.calls[0]?.[0]

    nativeListener?.(['steps'], 'delivery-listener-error')

    expect(mockNitroHealth.acknowledgeBackgroundChange).toHaveBeenCalledWith(
      'delivery-listener-error'
    )
    expect(() => jest.runOnlyPendingTimers()).toThrow(listenerError)
    result.subscription.remove()
  })

  it('rejects invalid or unavailable observer listener registration', () => {
    mockNitroHealth.getBackgroundChangesMode.mockReturnValue('observer')
    mockNitroHealth.setOnBackgroundChangeListener.mockReturnValue(false)

    expect(() => NitroHealth.subscribeToBackgroundChanges(undefined as never)).toThrow(
      'A background change listener function is required'
    )
    expect(() => NitroHealth.subscribeToBackgroundChanges(jest.fn())).toThrow(
      'Native observer listener registration is unavailable'
    )
  })
})
