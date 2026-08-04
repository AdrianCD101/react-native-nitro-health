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
  })

  it('delegates background delivery configuration to native', async () => {
    mockNitroHealth.enableBackgroundDelivery.mockResolvedValue(undefined)
    mockNitroHealth.disableBackgroundDelivery.mockResolvedValue(undefined)
    mockNitroHealth.disableAllBackgroundDelivery.mockResolvedValue(undefined)

    await expect(NitroHealth.enableBackgroundDelivery('steps', 'hourly')).resolves.toBeUndefined()
    await expect(NitroHealth.disableBackgroundDelivery('steps')).resolves.toBeUndefined()
    await expect(NitroHealth.disableAllBackgroundDelivery()).resolves.toBeUndefined()

    expect(mockNitroHealth.enableBackgroundDelivery).toHaveBeenCalledWith('steps', 'hourly')
    expect(mockNitroHealth.disableBackgroundDelivery).toHaveBeenCalledWith('steps')
    expect(mockNitroHealth.disableAllBackgroundDelivery).toHaveBeenCalledWith()
  })

  it('delegates Android background-read status and authorization to native', async () => {
    mockNitroHealth.getBackgroundReadAuthorizationStatus.mockResolvedValue('notGranted')
    mockNitroHealth.requestBackgroundReadAuthorization.mockResolvedValue('granted')

    await expect(NitroHealth.getBackgroundReadAuthorizationStatus()).resolves.toBe('notGranted')
    await expect(NitroHealth.requestBackgroundReadAuthorization()).resolves.toBe('granted')
  })

  it('multiplexes public listeners through one native callback', () => {
    const firstListener = jest.fn()
    const secondListener = jest.fn()
    const firstSubscription = NitroHealth.addOnChangeNotificationListener(firstListener)
    const secondSubscription = NitroHealth.addOnChangeNotificationListener(secondListener)

    expect(mockNitroHealth.setOnChangeNotificationListener).toHaveBeenCalledTimes(1)
    const nativeListener = mockNitroHealth.setOnChangeNotificationListener.mock.calls[0]?.[0] as
      | ((dataTypes: string[], deliveryId: string) => void)
      | undefined
    expect(nativeListener).toEqual(expect.any(Function))

    nativeListener?.(['steps', 'steps', 'sleep'], 'delivery-1')

    const expectedNotification = { dataTypes: ['steps', 'sleep'] }
    expect(firstListener).toHaveBeenCalledWith(expectedNotification)
    expect(secondListener).toHaveBeenCalledWith(expectedNotification)
    expect(mockNitroHealth.acknowledgeChangeNotification).toHaveBeenCalledWith('delivery-1')

    firstSubscription.remove()
    expect(mockNitroHealth.setOnChangeNotificationListener).toHaveBeenCalledTimes(1)

    secondSubscription.remove()
    secondSubscription.remove()
    expect(mockNitroHealth.setOnChangeNotificationListener).toHaveBeenLastCalledWith(undefined)
    expect(mockNitroHealth.setOnChangeNotificationListener).toHaveBeenCalledTimes(2)
  })

  it('supports registering the same listener function more than once', () => {
    const listener = jest.fn()
    const firstSubscription = NitroHealth.addOnChangeNotificationListener(listener)
    const secondSubscription = NitroHealth.addOnChangeNotificationListener(listener)
    const nativeListener = mockNitroHealth.setOnChangeNotificationListener.mock.calls[0]?.[0] as
      | ((dataTypes: string[], deliveryId: string) => void)
      | undefined

    firstSubscription.remove()
    nativeListener?.(['steps'], 'delivery-2')
    expect(listener).toHaveBeenCalledTimes(1)

    secondSubscription.remove()
  })

  it('rejects a missing listener before crossing the native boundary', () => {
    expect(() => NitroHealth.addOnChangeNotificationListener(undefined as never)).toThrow(
      'A change notification listener function is required'
    )
    expect(mockNitroHealth.setOnChangeNotificationListener).not.toHaveBeenCalled()
  })

  it('acknowledges before detaching when the last listener removes itself during dispatch', () => {
    let subscription: ListenerSubscription | undefined
    const listener = jest.fn(() => subscription?.remove())
    subscription = NitroHealth.addOnChangeNotificationListener(listener)
    const nativeListener = mockNitroHealth.setOnChangeNotificationListener.mock.calls[0]?.[0] as
      | ((dataTypes: string[], deliveryId: string) => void)
      | undefined

    nativeListener?.(['steps'], 'delivery-3')

    expect(listener).toHaveBeenCalledWith({ dataTypes: ['steps'] })
    expect(mockNitroHealth.acknowledgeChangeNotification).toHaveBeenCalledWith('delivery-3')
    expect(mockNitroHealth.setOnChangeNotificationListener).toHaveBeenLastCalledWith(undefined)

    const acknowledgeOrder =
      mockNitroHealth.acknowledgeChangeNotification.mock.invocationCallOrder[0] ?? 0
    const detachOrder =
      mockNitroHealth.setOnChangeNotificationListener.mock.invocationCallOrder[1] ?? 0
    expect(acknowledgeOrder).toBeLessThan(detachOrder)
  })

  it('acknowledges the delivery and rethrows the first listener error asynchronously', () => {
    jest.useFakeTimers()
    try {
      const failingListener = jest.fn(() => {
        throw new Error('listener failure')
      })
      const healthyListener = jest.fn()
      const firstSubscription = NitroHealth.addOnChangeNotificationListener(failingListener)
      const secondSubscription = NitroHealth.addOnChangeNotificationListener(healthyListener)
      const nativeListener = mockNitroHealth.setOnChangeNotificationListener.mock.calls[0]?.[0] as
        | ((dataTypes: string[], deliveryId: string) => void)
        | undefined

      nativeListener?.(['steps'], 'delivery-4')

      expect(healthyListener).toHaveBeenCalledWith({ dataTypes: ['steps'] })
      expect(mockNitroHealth.acknowledgeChangeNotification).toHaveBeenCalledWith('delivery-4')
      expect(() => jest.runAllTimers()).toThrow('listener failure')

      firstSubscription.remove()
      secondSubscription.remove()
    } finally {
      jest.useRealTimers()
    }
  })
})
