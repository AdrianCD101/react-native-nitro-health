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

  it('reads steps from the app UI after steps permission is granted', async () => {
    mockNitroHealth.getAvailabilityStatus.mockReturnValue('available')
    mockNitroHealth.requestAuthorization.mockResolvedValue(grantedStepsResult)
    mockNitroHealth.readSteps.mockResolvedValue([
      {
        startDate: new Date('2026-01-01T00:00:00.000Z'),
        endDate: new Date('2026-01-01T01:00:00.000Z'),
        count: 123,
      },
    ])

    render(<App />)

    fireEvent.press(screen.getByText('Request Steps permission'))
    expect(await screen.findByText('Steps authorization result: granted')).toBeTruthy()

    fireEvent.press(screen.getByText('Read Steps'))

    expect(await screen.findByText('Steps samples: 1')).toBeTruthy()
    expect(screen.getByText('Steps total: 123')).toBeTruthy()
    expect(mockNitroHealth.readSteps).toHaveBeenCalledWith({
      startDate: expect.any(Date),
      endDate: expect.any(Date),
      limit: 100,
      ascending: false,
    })
  })

  it('disables Read Steps until steps permission is granted', async () => {
    mockNitroHealth.getAvailabilityStatus.mockReturnValue('available')
    mockNitroHealth.requestAuthorization.mockResolvedValue(grantedStepsResult)

    render(<App />)

    // Before any grant the button is gated: a hint is shown and pressing does nothing.
    expect(screen.getByText('Grant Steps permission to read')).toBeTruthy()
    fireEvent.press(screen.getByText('Read Steps'))
    expect(mockNitroHealth.readSteps).not.toHaveBeenCalled()

    // Granting permission opens the gate.
    fireEvent.press(screen.getByText('Request Steps permission'))
    expect(await screen.findByText('Steps authorization result: granted')).toBeTruthy()
    expect(screen.queryByText('Grant Steps permission to read')).toBeNull()

    fireEvent.press(screen.getByText('Read Steps'))
    await waitFor(() => {
      expect(mockNitroHealth.readSteps).toHaveBeenCalledTimes(1)
    })
  })

  it('reads heart rate from the app UI after heart rate permission is granted', async () => {
    mockNitroHealth.getAvailabilityStatus.mockReturnValue('available')
    mockNitroHealth.requestAuthorization.mockResolvedValue(grantedHeartRateResult)
    mockNitroHealth.readHeartRate.mockResolvedValue([
      { date: new Date('2026-01-01T00:00:00.000Z'), bpm: 72, source: 'com.example.health' },
      { date: new Date('2026-01-01T00:01:00.000Z'), bpm: 76, source: 'com.example.health' },
    ])

    render(<App />)

    fireEvent.press(screen.getByText('Request Heart Rate permission'))
    expect(await screen.findByText('Heart Rate authorization result: granted')).toBeTruthy()

    fireEvent.press(screen.getByText('Read Heart Rate'))

    expect(await screen.findByText('Heart rate samples: 2')).toBeTruthy()
    expect(screen.getByText('Average bpm: 74')).toBeTruthy()
    expect(screen.getByText('Source: com.example.health')).toBeTruthy()
    expect(mockNitroHealth.readHeartRate).toHaveBeenCalledWith({
      startDate: expect.any(Date),
      endDate: expect.any(Date),
      limit: 100,
      ascending: false,
    })
  })

  it('disables Read Heart Rate until heart rate permission is granted', async () => {
    mockNitroHealth.getAvailabilityStatus.mockReturnValue('available')
    mockNitroHealth.requestAuthorization.mockResolvedValue(grantedHeartRateResult)

    render(<App />)

    expect(screen.getByText('Grant Heart Rate permission to read')).toBeTruthy()
    fireEvent.press(screen.getByText('Read Heart Rate'))
    expect(mockNitroHealth.readHeartRate).not.toHaveBeenCalled()

    fireEvent.press(screen.getByText('Request Heart Rate permission'))
    expect(await screen.findByText('Heart Rate authorization result: granted')).toBeTruthy()
    expect(screen.queryByText('Grant Heart Rate permission to read')).toBeNull()

    fireEvent.press(screen.getByText('Read Heart Rate'))
    await waitFor(() => {
      expect(mockNitroHealth.readHeartRate).toHaveBeenCalledTimes(1)
    })
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

    fireEvent.press(screen.getByText('Request Heart Rate permission'))
    expect(await screen.findByText('Heart Rate authorization result: denied')).toBeTruthy()

    fireEvent.press(screen.getByText('Open health settings'))

    await waitFor(() => {
      expect(mockNitroHealth.openHealthSettings).toHaveBeenCalledTimes(1)
    })
  })
})
