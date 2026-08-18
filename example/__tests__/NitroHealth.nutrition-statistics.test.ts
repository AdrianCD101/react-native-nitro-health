import { mockNitroHealth } from './support/mockNitroHealth'

jest.mock('react-native-nitro-modules', () => ({
  NitroModules: {
    createHybridObject: jest.fn(() => mockNitroHealth),
  },
}))

import { NitroHealth, type NutritionStatisticsDataType } from 'react-native-nitro-health'

const NUTRITION_STATISTICS_DATA_TYPES: NutritionStatisticsDataType[] = [
  'nutritionEnergyConsumed',
  'nutritionProtein',
  'nutritionTotalCarbohydrate',
  'nutritionTotalFat',
  'nutritionDietaryFiber',
  'nutritionSugar',
  'nutritionSodium',
]

describe('NitroHealth nutrition statistics contract', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it.each(NUTRITION_STATISTICS_DATA_TYPES)(
    'forwards %s sum queries to the Nitro hybrid object',
    async (dataType) => {
      const startDate = new Date('2026-01-01T00:00:00.000Z')
      const endDate = new Date('2026-01-08T00:00:00.000Z')
      mockNitroHealth.readStatistics.mockResolvedValue([])

      await expect(
        NitroHealth.readStatistics(dataType, {
          startDate,
          endDate,
          bucket: 'day',
          metrics: ['sum'],
        })
      ).resolves.toEqual([])

      expect(mockNitroHealth.readStatistics).toHaveBeenCalledWith(dataType, {
        startTimeMs: startDate.getTime(),
        endTimeMs: endDate.getTime(),
        bucket: 'day',
        metrics: ['sum'],
      })
    }
  )

  it.each(NUTRITION_STATISTICS_DATA_TYPES)(
    "rejects 'avg' for %s before crossing the native boundary",
    async (dataType) => {
      await expect(
        NitroHealth.readStatistics(dataType, {
          startDate: new Date('2026-01-01T00:00:00.000Z'),
          endDate: new Date('2026-01-08T00:00:00.000Z'),
          bucket: 'day',
          metrics: ['avg'],
        })
      ).rejects.toThrow(`Metric 'avg' is not supported for '${dataType}' (supported: sum)`)

      expect(mockNitroHealth.readStatistics).not.toHaveBeenCalled()
    }
  )

  it('maps nutrition statistics buckets to sums with Date instances', async () => {
    const startDate = new Date('2026-01-01T00:00:00.000Z')
    const endDate = new Date('2026-01-03T00:00:00.000Z')
    const bucketStartMs = startDate.getTime()
    const bucketEndMs = new Date('2026-01-02T00:00:00.000Z').getTime()
    mockNitroHealth.readStatistics.mockResolvedValue([
      { startTimeMs: bucketStartMs, endTimeMs: bucketEndMs, sum: 118.5, timeZone: 'UTC' },
    ])

    const result = await NitroHealth.readStatistics('nutritionProtein', {
      startDate,
      endDate,
      bucket: 'day',
      metrics: ['sum'],
    })

    expect(result).toHaveLength(1)
    expect(result[0].startDate).toBeInstanceOf(Date)
    expect(result[0].startDate.getTime()).toBe(bucketStartMs)
    expect(result[0].endDate.getTime()).toBe(bucketEndMs)
    expect(result[0].sum).toBe(118.5)
    expect(result[0]).not.toHaveProperty('scope')
  })

  it.each(NUTRITION_STATISTICS_DATA_TYPES)(
    'rejects %s as a permission entry — statistics ride the nutrition grant',
    async (dataType) => {
      const readPermissions = [{ accessType: 'read', dataType }] as const
      const writePermissions = [{ accessType: 'write', dataType }] as const

      // @ts-expect-error This test exercises runtime validation for untyped JavaScript callers.
      await expect(NitroHealth.requestAuthorization(readPermissions)).rejects.toThrow(
        'permissions[0]: a supported read or write permission is required'
      )
      // @ts-expect-error This test exercises runtime validation for untyped JavaScript callers.
      await expect(NitroHealth.getPermissionStatuses(writePermissions)).rejects.toThrow(
        'permissions[0]: a supported read or write permission is required'
      )
      expect(mockNitroHealth.requestAuthorization).not.toHaveBeenCalled()
      expect(mockNitroHealth.getPermissionStatuses).not.toHaveBeenCalled()
    }
  )
})
