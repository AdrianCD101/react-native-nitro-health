const mockNitroHealth = {
  getAvailabilityStatus: jest.fn(),
  getRequestStatusForAuthorization: jest.fn(),
  isAvailable: jest.fn(),
  openHealthConnectInstall: jest.fn(),
  readSteps: jest.fn(),
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

  it('reads steps through the Nitro hybrid object', async () => {
    const startDate = new Date('2026-01-01T00:00:00.000Z')
    const endDate = new Date('2026-01-02T00:00:00.000Z')
    const nativeResult = [
      {
        startTimeMs: startDate.getTime(),
        endTimeMs: endDate.getTime(),
        count: 123,
      },
    ]
    mockNitroHealth.readSteps.mockResolvedValue(nativeResult)

    await expect(
      NitroHealth.readSteps({ startDate, endDate, limit: 25, ascending: false })
    ).resolves.toEqual([{ startDate, endDate, count: 123 }])

    expect(mockNitroHealth.readSteps).toHaveBeenCalledWith({
      startTimeMs: startDate.getTime(),
      endTimeMs: endDate.getTime(),
      limit: 25,
      ascending: false,
    })
  })

  it('applies read steps defaults before crossing the native boundary', async () => {
    const startDate = new Date('2026-01-01T00:00:00.000Z')
    const endDate = new Date('2026-01-02T00:00:00.000Z')
    mockNitroHealth.readSteps.mockResolvedValue([])

    await expect(NitroHealth.readSteps({ startDate, endDate })).resolves.toEqual([])

    expect(mockNitroHealth.readSteps).toHaveBeenCalledWith({
      startTimeMs: startDate.getTime(),
      endTimeMs: endDate.getTime(),
      limit: 1000,
      ascending: true,
    })
  })

  it('rejects an invalid read steps start date before crossing the native boundary', async () => {
    await expect(
      NitroHealth.readSteps({
        startDate: new Date(Number.NaN),
        endDate: new Date('2026-01-02T00:00:00.000Z'),
      })
    ).rejects.toThrow('A valid startDate is required')

    expect(mockNitroHealth.readSteps).not.toHaveBeenCalled()
  })

  it('rejects an invalid read steps end date before crossing the native boundary', async () => {
    await expect(
      NitroHealth.readSteps({
        startDate: new Date('2026-01-01T00:00:00.000Z'),
        endDate: new Date(Number.NaN),
      })
    ).rejects.toThrow('A valid endDate is required')

    expect(mockNitroHealth.readSteps).not.toHaveBeenCalled()
  })

  it('rejects an inverted read steps date range before crossing the native boundary', async () => {
    await expect(
      NitroHealth.readSteps({
        startDate: new Date('2026-01-02T00:00:00.000Z'),
        endDate: new Date('2026-01-01T00:00:00.000Z'),
      })
    ).rejects.toThrow('startDate must be before endDate')

    expect(mockNitroHealth.readSteps).not.toHaveBeenCalled()
  })

  it('rejects an invalid read steps limit before crossing the native boundary', async () => {
    await expect(
      NitroHealth.readSteps({
        startDate: new Date('2026-01-01T00:00:00.000Z'),
        endDate: new Date('2026-01-02T00:00:00.000Z'),
        limit: 0,
      })
    ).rejects.toThrow('limit must be a positive integer')

    expect(mockNitroHealth.readSteps).not.toHaveBeenCalled()
  })

  it('rejects a fractional read steps limit before crossing the native boundary', async () => {
    await expect(
      NitroHealth.readSteps({
        startDate: new Date('2026-01-01T00:00:00.000Z'),
        endDate: new Date('2026-01-02T00:00:00.000Z'),
        limit: 1.5,
      })
    ).rejects.toThrow('limit must be a positive integer')

    expect(mockNitroHealth.readSteps).not.toHaveBeenCalled()
  })
})
