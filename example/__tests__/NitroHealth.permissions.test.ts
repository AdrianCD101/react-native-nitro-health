const mockNitroHealth = {
  getAvailabilityStatus: jest.fn(),
  getRequestStatusForAuthorization: jest.fn(),
  isAvailable: jest.fn(),
  openHealthConnectInstall: jest.fn(),
  requestAuthorization: jest.fn(),
}

jest.mock('react-native-nitro-modules', () => ({
  NitroModules: {
    createHybridObject: jest.fn(() => mockNitroHealth),
  },
}))

const { NitroHealth } = require('react-native-nitro-health')

describe('NitroHealth permission contract', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('gets request status through the Nitro hybrid object', async () => {
    const permissions = [{ accessType: 'read', dataType: 'steps' }]
    mockNitroHealth.getRequestStatusForAuthorization.mockResolvedValue('shouldRequest')

    await expect(NitroHealth.getRequestStatusForAuthorization(permissions)).resolves.toBe(
      'shouldRequest'
    )

    expect(mockNitroHealth.getRequestStatusForAuthorization).toHaveBeenCalledWith(permissions)
  })

  it('requests authorization through the Nitro hybrid object', async () => {
    const permissions = [{ accessType: 'read', dataType: 'steps' }]
    const result = {
      status: 'granted',
      availabilityStatus: 'available',
      requestStatus: 'unnecessary',
      grantedPermissions: permissions,
      deniedPermissions: [],
      unverifiablePermissions: [],
    }
    mockNitroHealth.requestAuthorization.mockResolvedValue(result)

    await expect(NitroHealth.requestAuthorization(permissions)).resolves.toEqual(result)

    expect(mockNitroHealth.requestAuthorization).toHaveBeenCalledWith(permissions)
  })

  it('rejects an empty request status check before crossing the native boundary', async () => {
    await expect(NitroHealth.getRequestStatusForAuthorization([])).rejects.toThrow(
      'At least one health permission is required'
    )

    expect(mockNitroHealth.getRequestStatusForAuthorization).not.toHaveBeenCalled()
  })

  it('rejects an empty authorization request before crossing the native boundary', async () => {
    await expect(NitroHealth.requestAuthorization([])).rejects.toThrow(
      'At least one health permission is required'
    )

    expect(mockNitroHealth.requestAuthorization).not.toHaveBeenCalled()
  })
})
