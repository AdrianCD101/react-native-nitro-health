import { mockNitroHealth } from './support/mockNitroHealth'

jest.mock('react-native-nitro-modules', () => ({
  NitroModules: {
    createHybridObject: jest.fn(() => mockNitroHealth),
  },
}))

import { NitroHealth, type HealthPermission } from 'react-native-nitro-health'

describe('NitroHealth aggregate-only energy statistics contract', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('forwards basalEnergyBurned statistics queries to the Nitro hybrid object', async () => {
    const startDate = new Date('2026-01-01T00:00:00.000Z')
    const endDate = new Date('2026-01-08T00:00:00.000Z')
    mockNitroHealth.readStatistics.mockResolvedValue([])

    await expect(
      NitroHealth.readStatistics('basalEnergyBurned', {
        startDate,
        endDate,
        bucket: 'day',
        metrics: ['sum'],
      })
    ).resolves.toEqual([])

    expect(mockNitroHealth.readStatistics).toHaveBeenCalledWith('basalEnergyBurned', {
      startTimeMs: startDate.getTime(),
      endTimeMs: endDate.getTime(),
      bucket: 'day',
      metrics: ['sum'],
    })
  })

  it('maps totalEnergyBurned buckets to kilocalorie sums with Date instances', async () => {
    const startDate = new Date('2026-01-01T00:00:00.000Z')
    const endDate = new Date('2026-01-03T00:00:00.000Z')
    const bucketStartMs = startDate.getTime()
    const bucketEndMs = new Date('2026-01-02T00:00:00.000Z').getTime()
    mockNitroHealth.readStatistics.mockResolvedValue([
      { startTimeMs: bucketStartMs, endTimeMs: bucketEndMs, sum: 2450.5 },
    ])

    const result = await NitroHealth.readStatistics('totalEnergyBurned', {
      startDate,
      endDate,
      bucket: 'day',
      metrics: ['sum'],
    })

    expect(result).toHaveLength(1)
    expect(result[0].startDate).toBeInstanceOf(Date)
    expect(result[0].startDate.getTime()).toBe(bucketStartMs)
    expect(result[0].endDate.getTime()).toBe(bucketEndMs)
    expect(result[0].sum).toBe(2450.5)
    expect(result[0]).not.toHaveProperty('scope')
  })

  it("rejects 'avg' for basalEnergyBurned before crossing the native boundary", async () => {
    await expect(
      NitroHealth.readStatistics('basalEnergyBurned', {
        startDate: new Date('2026-01-01T00:00:00.000Z'),
        endDate: new Date('2026-01-08T00:00:00.000Z'),
        bucket: 'day',
        metrics: ['avg'],
      })
    ).rejects.toThrow(`Metric 'avg' is not supported for 'basalEnergyBurned' (supported: sum)`)

    expect(mockNitroHealth.readStatistics).not.toHaveBeenCalled()
  })

  it("rejects 'max' for totalEnergyBurned before crossing the native boundary", async () => {
    await expect(
      NitroHealth.readStatistics('totalEnergyBurned', {
        startDate: new Date('2026-01-01T00:00:00.000Z'),
        endDate: new Date('2026-01-08T00:00:00.000Z'),
        bucket: 'day',
        metrics: ['max'],
      })
    ).rejects.toThrow(`Metric 'max' is not supported for 'totalEnergyBurned' (supported: sum)`)

    expect(mockNitroHealth.readStatistics).not.toHaveBeenCalled()
  })

  it('accepts read permissions for both aggregate-only energy types', async () => {
    const permissions: HealthPermission[] = [
      { accessType: 'read', dataType: 'basalEnergyBurned' },
      { accessType: 'read', dataType: 'totalEnergyBurned' },
    ]
    mockNitroHealth.requestAuthorization.mockResolvedValue({
      status: 'completed',
      availability: { status: 'available' },
      statuses: permissions.map((permission) => ({ permission, status: 'unverifiable' as const })),
    })

    await expect(NitroHealth.requestAuthorization(permissions)).resolves.toEqual({
      status: 'completed',
      statuses: permissions.map((permission) => ({ permission, status: 'unverifiable' })),
    })
    expect(mockNitroHealth.requestAuthorization).toHaveBeenCalledWith(permissions)
  })

  it('rejects write permissions for aggregate-only energy types before crossing the bridge', async () => {
    const permissions = [
      { accessType: 'write', dataType: 'totalEnergyBurned' },
    ] as unknown as HealthPermission[]

    await expect(NitroHealth.requestAuthorization(permissions)).rejects.toThrow(
      'permissions[0]: totalEnergyBurned is an aggregate-only read type'
    )

    expect(mockNitroHealth.requestAuthorization).not.toHaveBeenCalled()
  })
})
