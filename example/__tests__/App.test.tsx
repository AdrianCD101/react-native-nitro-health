import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native'

jest.mock('react-native-nitro-health', () => require('../../jest/mock'))

const { NitroHealth: mockNitroHealth, resetNitroHealthMock } = require('../../jest/mock')

const grantedStepsResult = {
  status: 'granted',
  availabilityStatus: 'available',
  requestStatus: 'unnecessary',
  grantedPermissions: [{ accessType: 'read', dataType: 'steps' }],
  deniedPermissions: [],
  unverifiablePermissions: [],
}

const grantedDistanceResult = {
  status: 'granted',
  availabilityStatus: 'available',
  requestStatus: 'unnecessary',
  grantedPermissions: [{ accessType: 'read', dataType: 'distance' }],
  deniedPermissions: [],
  unverifiablePermissions: [],
}

const grantedActiveEnergyResult = {
  status: 'granted',
  availabilityStatus: 'available',
  requestStatus: 'unnecessary',
  grantedPermissions: [{ accessType: 'read', dataType: 'activeEnergyBurned' }],
  deniedPermissions: [],
  unverifiablePermissions: [],
}

const grantedHeartRateResult = {
  status: 'granted',
  availabilityStatus: 'available',
  requestStatus: 'unnecessary',
  grantedPermissions: [{ accessType: 'read', dataType: 'heartRate' }],
  deniedPermissions: [],
  unverifiablePermissions: [],
}

const completedHeartRateResult = {
  status: 'completed',
  availabilityStatus: 'available',
  requestStatus: 'unnecessary',
  grantedPermissions: [],
  deniedPermissions: [],
  unverifiablePermissions: [{ accessType: 'read', dataType: 'heartRate' }],
}

const deniedHeartRateResult = {
  status: 'denied',
  availabilityStatus: 'available',
  requestStatus: 'shouldRequest',
  grantedPermissions: [],
  deniedPermissions: [{ accessType: 'read', dataType: 'heartRate' }],
  unverifiablePermissions: [],
}

const App = require('../App').default

describe('App', () => {
  beforeEach(() => {
    resetNitroHealthMock()
  })

  it('shows Available when health APIs are available', () => {
    mockNitroHealth.getAvailabilityStatus.mockReturnValue('available')

    render(<App />)

    expect(screen.getByText('Available')).toBeTruthy()
    expect(screen.getByText('Status: available')).toBeTruthy()
    expect(screen.getByText('Steps request status: not checked')).toBeTruthy()
    expect(screen.getByText('Distance request status: not checked')).toBeTruthy()
    expect(screen.getByText('Active Energy request status: not checked')).toBeTruthy()
    expect(screen.getByText('Heart Rate request status: not checked')).toBeTruthy()
  })

  it('shows Unavailable when health APIs are unavailable', () => {
    mockNitroHealth.getAvailabilityStatus.mockReturnValue('unavailable')

    render(<App />)

    expect(screen.getByText('Unavailable')).toBeTruthy()
    expect(screen.getByText('Status: unavailable')).toBeTruthy()
  })

  it('shows a Health Connect install or update prompt when required', () => {
    mockNitroHealth.getAvailabilityStatus.mockReturnValue('providerUpdateRequired')

    render(<App />)

    expect(screen.getByText('Install or update Health Connect')).toBeTruthy()
    expect(screen.getByText('Status: providerUpdateRequired')).toBeTruthy()

    fireEvent.press(screen.getByText('Open Health Connect install'))

    expect(mockNitroHealth.openHealthConnectInstall).toHaveBeenCalledTimes(1)
  })

  it('checks steps permission status from the app UI', async () => {
    mockNitroHealth.getAvailabilityStatus.mockReturnValue('available')
    mockNitroHealth.getRequestStatusForAuthorization.mockResolvedValue('shouldRequest')

    render(<App />)

    fireEvent.press(screen.getByText('Check Steps permission'))

    expect(await screen.findByText('Steps request status: shouldRequest')).toBeTruthy()
    expect(mockNitroHealth.getRequestStatusForAuthorization).toHaveBeenCalledWith([
      { accessType: 'read', dataType: 'steps' },
    ])
  })

  it('checks Heart Rate permission status from the app UI', async () => {
    mockNitroHealth.getAvailabilityStatus.mockReturnValue('available')
    mockNitroHealth.getRequestStatusForAuthorization.mockResolvedValue('shouldRequest')

    render(<App />)

    fireEvent.press(screen.getByText('Check Heart Rate permission'))

    expect(await screen.findByText('Heart Rate request status: shouldRequest')).toBeTruthy()
    expect(mockNitroHealth.getRequestStatusForAuthorization).toHaveBeenCalledWith([
      { accessType: 'read', dataType: 'heartRate' },
    ])
  })

  it('checks Distance permission status from the app UI', async () => {
    mockNitroHealth.getAvailabilityStatus.mockReturnValue('available')
    mockNitroHealth.getRequestStatusForAuthorization.mockResolvedValue('shouldRequest')

    render(<App />)

    fireEvent.press(screen.getByText('Check Distance permission'))

    expect(await screen.findByText('Distance request status: shouldRequest')).toBeTruthy()
    expect(mockNitroHealth.getRequestStatusForAuthorization).toHaveBeenCalledWith([
      { accessType: 'read', dataType: 'distance' },
    ])
  })

  it('checks Active Energy permission status from the app UI', async () => {
    mockNitroHealth.getAvailabilityStatus.mockReturnValue('available')
    mockNitroHealth.getRequestStatusForAuthorization.mockResolvedValue('shouldRequest')

    render(<App />)

    fireEvent.press(screen.getByText('Check Active Energy permission'))

    expect(await screen.findByText('Active Energy request status: shouldRequest')).toBeTruthy()
    expect(mockNitroHealth.getRequestStatusForAuthorization).toHaveBeenCalledWith([
      { accessType: 'read', dataType: 'activeEnergyBurned' },
    ])
  })

  it('requests steps permission from the app UI', async () => {
    mockNitroHealth.getAvailabilityStatus.mockReturnValue('available')
    mockNitroHealth.requestAuthorization.mockResolvedValue(grantedStepsResult)

    render(<App />)

    fireEvent.press(screen.getByText('Request Steps permission'))

    expect(await screen.findByText('Steps authorization result: granted')).toBeTruthy()
    expect(screen.getByText('Steps request status: unnecessary')).toBeTruthy()
    expect(screen.getByText('Steps granted: 1 | denied: 0 | unverifiable: 0')).toBeTruthy()
    expect(mockNitroHealth.requestAuthorization).toHaveBeenCalledWith([
      { accessType: 'read', dataType: 'steps' },
    ])
  })

  it('reads daily step totals from the app UI after steps permission is granted', async () => {
    mockNitroHealth.getAvailabilityStatus.mockReturnValue('available')
    mockNitroHealth.requestAuthorization.mockResolvedValue(grantedStepsResult)
    mockNitroHealth.readDailyStepTotals.mockResolvedValue([
      {
        startDate: new Date('2026-01-01T00:00:00.000Z'),
        endDate: new Date('2026-01-02T00:00:00.000Z'),
        count: 123,
      },
    ])

    render(<App />)

    fireEvent.press(screen.getByText('Request Steps permission'))
    expect(await screen.findByText('Steps authorization result: granted')).toBeTruthy()

    fireEvent.press(screen.getByText('Read daily step totals'))

    expect(await screen.findByText('Daily step buckets: 1')).toBeTruthy()
    expect(screen.getByText(/123 steps/)).toBeTruthy()
    expect(mockNitroHealth.readDailyStepTotals).toHaveBeenCalledWith({
      startDate: expect.any(Date),
      endDate: expect.any(Date),
      limit: 7,
      ascending: false,
    })
  })

  it('reads daily distance totals from the app UI after distance permission is granted', async () => {
    mockNitroHealth.getAvailabilityStatus.mockReturnValue('available')
    mockNitroHealth.requestAuthorization.mockResolvedValue(grantedDistanceResult)
    mockNitroHealth.readDailyDistanceTotals.mockResolvedValue([
      {
        startDate: new Date('2026-01-01T00:00:00.000Z'),
        endDate: new Date('2026-01-02T00:00:00.000Z'),
        distanceMeters: 1234,
      },
    ])

    render(<App />)

    fireEvent.press(screen.getByText('Request Distance permission'))
    expect(await screen.findByText('Distance authorization result: granted')).toBeTruthy()

    fireEvent.press(screen.getByText('Read daily distance totals'))

    expect(await screen.findByText('Daily distance buckets: 1')).toBeTruthy()
    expect(screen.getByText(/1234 m/)).toBeTruthy()
    expect(mockNitroHealth.readDailyDistanceTotals).toHaveBeenCalledWith({
      startDate: expect.any(Date),
      endDate: expect.any(Date),
      limit: 7,
      ascending: false,
    })
  })

  it('reads daily active energy totals from the app UI after active energy permission is granted', async () => {
    mockNitroHealth.getAvailabilityStatus.mockReturnValue('available')
    mockNitroHealth.requestAuthorization.mockResolvedValue(grantedActiveEnergyResult)
    mockNitroHealth.readDailyActiveEnergyBurnedTotals.mockResolvedValue([
      {
        startDate: new Date('2026-01-01T00:00:00.000Z'),
        endDate: new Date('2026-01-02T00:00:00.000Z'),
        kilocalories: 321,
      },
    ])

    render(<App />)

    fireEvent.press(screen.getByText('Request Active Energy permission'))
    expect(await screen.findByText('Active Energy authorization result: granted')).toBeTruthy()

    fireEvent.press(screen.getByText('Read daily active energy totals'))

    expect(await screen.findByText('Daily active-energy buckets: 1')).toBeTruthy()
    expect(screen.getByText(/321 kcal/)).toBeTruthy()
    expect(mockNitroHealth.readDailyActiveEnergyBurnedTotals).toHaveBeenCalledWith({
      startDate: expect.any(Date),
      endDate: expect.any(Date),
      limit: 7,
      ascending: false,
    })
  })

  it('requests steps permission on demand when reading daily step totals', async () => {
    mockNitroHealth.getAvailabilityStatus.mockReturnValue('available')
    mockNitroHealth.requestAuthorization.mockResolvedValue(grantedStepsResult)
    mockNitroHealth.readDailyStepTotals.mockResolvedValue([])

    render(<App />)

    // No prior grant needed: reading requests authorization first, then reads.
    fireEvent.press(screen.getByText('Read daily step totals'))

    await waitFor(() => {
      expect(mockNitroHealth.readDailyStepTotals).toHaveBeenCalledTimes(1)
    })
    expect(mockNitroHealth.requestAuthorization).toHaveBeenCalledWith([
      { accessType: 'read', dataType: 'steps' },
    ])
  })

  it('blocks reading daily step totals when read permission is denied', async () => {
    mockNitroHealth.getAvailabilityStatus.mockReturnValue('available')
    mockNitroHealth.requestAuthorization.mockResolvedValue({
      status: 'denied',
      availabilityStatus: 'available',
      requestStatus: 'shouldRequest',
      grantedPermissions: [],
      deniedPermissions: [{ accessType: 'read', dataType: 'steps' }],
      unverifiablePermissions: [],
    })

    render(<App />)

    fireEvent.press(screen.getByText('Read daily step totals'))

    expect(
      await screen.findByText('Read permission denied. Open health settings to enable it.')
    ).toBeTruthy()
    expect(mockNitroHealth.readDailyStepTotals).not.toHaveBeenCalled()
  })

  it('saves a steps sample after requesting write permission on demand', async () => {
    mockNitroHealth.getAvailabilityStatus.mockReturnValue('available')
    mockNitroHealth.requestAuthorization.mockResolvedValue({
      status: 'granted',
      availabilityStatus: 'available',
      requestStatus: 'unnecessary',
      grantedPermissions: [{ accessType: 'write', dataType: 'steps' }],
      deniedPermissions: [],
      unverifiablePermissions: [],
    })
    mockNitroHealth.saveSteps.mockResolvedValue(undefined)

    render(<App />)

    fireEvent.press(screen.getByText('Save sample steps'))

    expect(await screen.findByText('Saved 250 steps over the last minute')).toBeTruthy()
    expect(mockNitroHealth.requestAuthorization).toHaveBeenCalledWith([
      { accessType: 'write', dataType: 'steps' },
    ])
    expect(mockNitroHealth.saveSteps).toHaveBeenCalledWith([
      { startDate: expect.any(Date), endDate: expect.any(Date), count: 250 },
    ])
  })

  it('blocks saving steps when write permission is denied', async () => {
    mockNitroHealth.getAvailabilityStatus.mockReturnValue('available')
    mockNitroHealth.requestAuthorization.mockResolvedValue({
      status: 'denied',
      availabilityStatus: 'available',
      requestStatus: 'shouldRequest',
      grantedPermissions: [],
      deniedPermissions: [{ accessType: 'write', dataType: 'steps' }],
      unverifiablePermissions: [],
    })

    render(<App />)

    fireEvent.press(screen.getByText('Save sample steps'))

    expect(
      await screen.findByText('Write permission denied. Open health settings to enable it.')
    ).toBeTruthy()
    expect(mockNitroHealth.saveSteps).not.toHaveBeenCalled()
  })

  it('reads heart rate statistics from the app UI after heart rate permission is granted', async () => {
    mockNitroHealth.getAvailabilityStatus.mockReturnValue('available')
    mockNitroHealth.requestAuthorization.mockResolvedValue(grantedHeartRateResult)
    mockNitroHealth.readHeartRateStatistics.mockResolvedValue({ average: 74, min: 72, max: 76 })

    render(<App />)

    fireEvent.press(screen.getByText('Request Heart Rate permission'))
    expect(await screen.findByText('Heart Rate authorization result: granted')).toBeTruthy()

    fireEvent.press(screen.getByText('Read Heart Rate stats'))

    expect(await screen.findByText('Average bpm: 74')).toBeTruthy()
    expect(screen.getByText('Min bpm: 72')).toBeTruthy()
    expect(screen.getByText('Max bpm: 76')).toBeTruthy()
    expect(mockNitroHealth.readHeartRateStatistics).toHaveBeenCalledWith({
      startDate: expect.any(Date),
      endDate: expect.any(Date),
    })
  })

  it('renders missing heart rate statistics as n/a', async () => {
    mockNitroHealth.getAvailabilityStatus.mockReturnValue('available')
    mockNitroHealth.requestAuthorization.mockResolvedValue(grantedHeartRateResult)
    mockNitroHealth.readHeartRateStatistics.mockResolvedValue({})

    render(<App />)

    fireEvent.press(screen.getByText('Request Heart Rate permission'))
    expect(await screen.findByText('Heart Rate authorization result: granted')).toBeTruthy()

    fireEvent.press(screen.getByText('Read Heart Rate stats'))

    expect(await screen.findByText('Average bpm: n/a')).toBeTruthy()
    expect(screen.getByText('Min bpm: n/a')).toBeTruthy()
    expect(screen.getByText('Max bpm: n/a')).toBeTruthy()
  })

  it('requests heart rate permission on demand when reading Heart Rate stats', async () => {
    mockNitroHealth.getAvailabilityStatus.mockReturnValue('available')
    mockNitroHealth.requestAuthorization.mockResolvedValue(grantedHeartRateResult)
    mockNitroHealth.readHeartRateStatistics.mockResolvedValue({})

    render(<App />)

    fireEvent.press(screen.getByText('Read Heart Rate stats'))

    await waitFor(() => {
      expect(mockNitroHealth.readHeartRateStatistics).toHaveBeenCalledTimes(1)
    })
    expect(mockNitroHealth.requestAuthorization).toHaveBeenCalledWith([
      { accessType: 'read', dataType: 'heartRate' },
    ])
  })

  it('requests Heart Rate permission from the app UI', async () => {
    mockNitroHealth.getAvailabilityStatus.mockReturnValue('available')
    mockNitroHealth.requestAuthorization.mockResolvedValue(completedHeartRateResult)

    render(<App />)

    fireEvent.press(screen.getByText('Request Heart Rate permission'))

    expect(await screen.findByText('Heart Rate authorization result: completed')).toBeTruthy()
    expect(screen.getByText('Heart Rate request status: unnecessary')).toBeTruthy()
    expect(screen.getByText('Heart Rate granted: 0 | denied: 0 | unverifiable: 1')).toBeTruthy()
    expect(mockNitroHealth.requestAuthorization).toHaveBeenCalledWith([
      { accessType: 'read', dataType: 'heartRate' },
    ])
  })

  it('opens health settings after a denied permission result', async () => {
    mockNitroHealth.getAvailabilityStatus.mockReturnValue('available')
    mockNitroHealth.requestAuthorization.mockResolvedValue(deniedHeartRateResult)
    mockNitroHealth.openHealthSettings.mockResolvedValue(true)

    render(<App />)

    // The standalone settings link at the top is always present.
    expect(screen.getAllByText('Open health settings')).toHaveLength(1)

    fireEvent.press(screen.getByText('Request Heart Rate permission'))
    expect(await screen.findByText('Heart Rate authorization result: denied')).toBeTruthy()

    // A denial surfaces a second, card-level settings button.
    const settingsButtons = screen.getAllByText('Open health settings')
    expect(settingsButtons).toHaveLength(2)
    fireEvent.press(settingsButtons[1])

    await waitFor(() => {
      expect(mockNitroHealth.openHealthSettings).toHaveBeenCalledTimes(1)
    })
  })

  it('opens health settings from the standalone link', async () => {
    mockNitroHealth.getAvailabilityStatus.mockReturnValue('available')
    mockNitroHealth.openHealthSettings.mockResolvedValue(true)

    render(<App />)

    fireEvent.press(screen.getByText('Open health settings'))

    await waitFor(() => {
      expect(mockNitroHealth.openHealthSettings).toHaveBeenCalledTimes(1)
    })
  })
})
