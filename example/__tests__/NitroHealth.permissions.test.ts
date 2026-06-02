const mockNitroHealth = {
  getAvailabilityStatus: jest.fn(),
  getRequestStatusForAuthorization: jest.fn(),
  isAvailable: jest.fn(),
  openHealthConnectInstall: jest.fn(),
  readActiveEnergyBurned: jest.fn(),
  readDailyActiveEnergyBurnedTotals: jest.fn(),
  readDailyDistanceTotals: jest.fn(),
  readDailyStepTotals: jest.fn(),
  readDistance: jest.fn(),
  readHeartRate: jest.fn(),
  readHeartRateStatistics: jest.fn(),
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

  it('reads daily step totals through the Nitro hybrid object', async () => {
    const startDate = new Date('2026-01-01T00:00:00.000Z')
    const endDate = new Date('2026-01-08T00:00:00.000Z')
    const nativeResult = [
      {
        startTimeMs: startDate.getTime(),
        endTimeMs: new Date('2026-01-02T00:00:00.000Z').getTime(),
        count: 456,
      },
    ]
    mockNitroHealth.readDailyStepTotals.mockResolvedValue(nativeResult)

    await expect(
      NitroHealth.readDailyStepTotals({ startDate, endDate, limit: 7, ascending: false })
    ).resolves.toEqual([
      {
        startDate,
        endDate: new Date('2026-01-02T00:00:00.000Z'),
        count: 456,
      },
    ])

    expect(mockNitroHealth.readDailyStepTotals).toHaveBeenCalledWith({
      startTimeMs: startDate.getTime(),
      endTimeMs: endDate.getTime(),
      limit: 7,
      ascending: false,
    })
  })

  it('reads distance through the Nitro hybrid object', async () => {
    const startDate = new Date('2026-01-01T00:00:00.000Z')
    const endDate = new Date('2026-01-02T00:00:00.000Z')
    const nativeResult = [
      {
        startTimeMs: startDate.getTime(),
        endTimeMs: endDate.getTime(),
        distanceMeters: 1234,
      },
    ]
    mockNitroHealth.readDistance.mockResolvedValue(nativeResult)

    await expect(
      NitroHealth.readDistance({ startDate, endDate, limit: 25, ascending: false })
    ).resolves.toEqual([{ startDate, endDate, distanceMeters: 1234 }])

    expect(mockNitroHealth.readDistance).toHaveBeenCalledWith({
      startTimeMs: startDate.getTime(),
      endTimeMs: endDate.getTime(),
      limit: 25,
      ascending: false,
    })
  })

  it('reads daily distance totals through the Nitro hybrid object', async () => {
    const startDate = new Date('2026-01-01T00:00:00.000Z')
    const endDate = new Date('2026-01-08T00:00:00.000Z')
    const bucketEndDate = new Date('2026-01-02T00:00:00.000Z')
    mockNitroHealth.readDailyDistanceTotals.mockResolvedValue([
      {
        startTimeMs: startDate.getTime(),
        endTimeMs: bucketEndDate.getTime(),
        distanceMeters: 2500,
      },
    ])

    await expect(
      NitroHealth.readDailyDistanceTotals({ startDate, endDate, limit: 7, ascending: false })
    ).resolves.toEqual([
      {
        startDate,
        endDate: bucketEndDate,
        distanceMeters: 2500,
      },
    ])

    expect(mockNitroHealth.readDailyDistanceTotals).toHaveBeenCalledWith({
      startTimeMs: startDate.getTime(),
      endTimeMs: endDate.getTime(),
      limit: 7,
      ascending: false,
    })
  })

  it('reads active energy burned through the Nitro hybrid object', async () => {
    const startDate = new Date('2026-01-01T00:00:00.000Z')
    const endDate = new Date('2026-01-02T00:00:00.000Z')
    mockNitroHealth.readActiveEnergyBurned.mockResolvedValue([
      {
        startTimeMs: startDate.getTime(),
        endTimeMs: endDate.getTime(),
        kilocalories: 321,
      },
    ])

    await expect(
      NitroHealth.readActiveEnergyBurned({ startDate, endDate, limit: 25, ascending: false })
    ).resolves.toEqual([{ startDate, endDate, kilocalories: 321 }])

    expect(mockNitroHealth.readActiveEnergyBurned).toHaveBeenCalledWith({
      startTimeMs: startDate.getTime(),
      endTimeMs: endDate.getTime(),
      limit: 25,
      ascending: false,
    })
  })

  it('reads daily active energy burned totals through the Nitro hybrid object', async () => {
    const startDate = new Date('2026-01-01T00:00:00.000Z')
    const endDate = new Date('2026-01-08T00:00:00.000Z')
    const bucketEndDate = new Date('2026-01-02T00:00:00.000Z')
    mockNitroHealth.readDailyActiveEnergyBurnedTotals.mockResolvedValue([
      {
        startTimeMs: startDate.getTime(),
        endTimeMs: bucketEndDate.getTime(),
        kilocalories: 456,
      },
    ])

    await expect(
      NitroHealth.readDailyActiveEnergyBurnedTotals({
        startDate,
        endDate,
        limit: 7,
        ascending: false,
      })
    ).resolves.toEqual([
      {
        startDate,
        endDate: bucketEndDate,
        kilocalories: 456,
      },
    ])

    expect(mockNitroHealth.readDailyActiveEnergyBurnedTotals).toHaveBeenCalledWith({
      startTimeMs: startDate.getTime(),
      endTimeMs: endDate.getTime(),
      limit: 7,
      ascending: false,
    })
  })

  it('reads heart rate through the Nitro hybrid object', async () => {
    const startDate = new Date('2026-01-01T00:00:00.000Z')
    const endDate = new Date('2026-01-02T00:00:00.000Z')
    const nativeResult = [
      {
        timeMs: startDate.getTime(),
        bpm: 72,
        source: 'com.example.health',
      },
    ]
    mockNitroHealth.readHeartRate.mockResolvedValue(nativeResult)

    await expect(
      NitroHealth.readHeartRate({ startDate, endDate, limit: 25, ascending: false })
    ).resolves.toEqual([{ date: startDate, bpm: 72, source: 'com.example.health' }])

    expect(mockNitroHealth.readHeartRate).toHaveBeenCalledWith({
      startTimeMs: startDate.getTime(),
      endTimeMs: endDate.getTime(),
      limit: 25,
      ascending: false,
    })
  })

  it('applies read heart rate defaults before crossing the native boundary', async () => {
    const startDate = new Date('2026-01-01T00:00:00.000Z')
    const endDate = new Date('2026-01-02T00:00:00.000Z')
    mockNitroHealth.readHeartRate.mockResolvedValue([])

    await expect(NitroHealth.readHeartRate({ startDate, endDate })).resolves.toEqual([])

    expect(mockNitroHealth.readHeartRate).toHaveBeenCalledWith({
      startTimeMs: startDate.getTime(),
      endTimeMs: endDate.getTime(),
      limit: 1000,
      ascending: true,
    })
  })

  it('reads heart rate statistics through the Nitro hybrid object', async () => {
    const startDate = new Date('2026-01-01T00:00:00.000Z')
    const endDate = new Date('2026-01-02T00:00:00.000Z')
    mockNitroHealth.readHeartRateStatistics.mockResolvedValue({
      average: 72,
      min: undefined,
      max: 92,
    })

    await expect(NitroHealth.readHeartRateStatistics({ startDate, endDate })).resolves.toEqual({
      average: 72,
      min: undefined,
      max: 92,
    })

    expect(mockNitroHealth.readHeartRateStatistics).toHaveBeenCalledWith({
      startTimeMs: startDate.getTime(),
      endTimeMs: endDate.getTime(),
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
