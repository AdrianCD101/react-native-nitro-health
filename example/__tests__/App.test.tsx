import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react-native'

const mockNitroHealth = {
  getAvailabilityStatus: jest.fn(),
  getRequestStatusForAuthorization: jest.fn(),
  openHealthConnectInstall: jest.fn(),
  openHealthSettings: jest.fn(),
  requestAuthorization: jest.fn(),
}

const grantedStepsResult = {
  status: 'granted',
  availabilityStatus: 'available',
  requestStatus: 'unnecessary',
  grantedPermissions: [{ accessType: 'read', dataType: 'steps' }],
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

jest.mock('react-native-nitro-modules', () => ({
  NitroModules: {
    createHybridObject: jest.fn(() => mockNitroHealth),
  },
}))

const App = require('../App').default

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks()
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

    fireEvent.press(screen.getByText('Check steps permission'))

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

    fireEvent.press(screen.getByText('Request steps permission'))

    expect(await screen.findByText('Steps authorization result: granted')).toBeTruthy()
    expect(screen.getByText('Steps request status: unnecessary')).toBeTruthy()
    expect(screen.getByText('Steps granted: 1 | denied: 0 | unverifiable: 0')).toBeTruthy()
    expect(mockNitroHealth.requestAuthorization).toHaveBeenCalledWith([
      { accessType: 'read', dataType: 'steps' },
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

    fireEvent.press(screen.getByText('Request Heart Rate permission'))
    expect(await screen.findByText('Heart Rate authorization result: denied')).toBeTruthy()

    fireEvent.press(screen.getByText('Open health settings'))

    expect(mockNitroHealth.openHealthSettings).toHaveBeenCalledTimes(1)
  })
})
