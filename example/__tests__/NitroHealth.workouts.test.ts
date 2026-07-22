import { mockNitroHealth } from './support/mockNitroHealth'

jest.mock('react-native-nitro-modules', () => ({
  NitroModules: {
    createHybridObject: jest.fn(() => mockNitroHealth),
  },
}))

import { NitroHealth } from 'react-native-nitro-health'

describe('NitroHealth workouts contract', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('readWorkouts', () => {
    it('forwards converted args and maps native results to Date instances', async () => {
      const startDate = new Date('2026-01-01T00:00:00.000Z')
      const endDate = new Date('2026-01-08T00:00:00.000Z')
      const workoutStartMs = new Date('2026-01-02T07:00:00.000Z').getTime()
      const workoutEndMs = new Date('2026-01-02T07:45:00.000Z').getTime()
      mockNitroHealth.readWorkouts.mockResolvedValue([
        {
          startTimeMs: workoutStartMs,
          endTimeMs: workoutEndMs,
          durationSeconds: 2580,
          activityType: 'running',
          title: 'Morning Run',
          source: 'Watch',
          totalDistanceMeters: 7500,
          totalEnergyBurnedKcal: 512.5,
        },
      ])

      const result = await NitroHealth.readWorkouts({ startDate, endDate })

      expect(mockNitroHealth.readWorkouts).toHaveBeenCalledWith({
        startTimeMs: startDate.getTime(),
        endTimeMs: endDate.getTime(),
        limit: 1000,
        ascending: true,
      })
      expect(result).toHaveLength(1)
      expect(result[0].startDate).toBeInstanceOf(Date)
      expect(result[0].startDate.getTime()).toBe(workoutStartMs)
      expect(result[0].endDate).toBeInstanceOf(Date)
      expect(result[0].endDate.getTime()).toBe(workoutEndMs)
      expect(result[0].durationSeconds).toBe(2580)
      expect(result[0].activityType).toBe('running')
      expect(result[0].title).toBe('Morning Run')
      expect(result[0].source).toBe('Watch')
      expect(result[0].totalDistanceMeters).toBe(7500)
      expect(result[0].totalEnergyBurnedKcal).toBe(512.5)
    })

    it('forwards explicit limit and ascending options', async () => {
      const startDate = new Date('2026-01-01T00:00:00.000Z')
      const endDate = new Date('2026-01-08T00:00:00.000Z')
      mockNitroHealth.readWorkouts.mockResolvedValue([])

      await NitroHealth.readWorkouts({ startDate, endDate, limit: 20, ascending: false })

      expect(mockNitroHealth.readWorkouts).toHaveBeenCalledWith({
        startTimeMs: startDate.getTime(),
        endTimeMs: endDate.getTime(),
        limit: 20,
        ascending: false,
      })
    })

    it('leaves optional fields undefined when the native side omits them (Android totals)', async () => {
      const startDate = new Date('2026-01-01T00:00:00.000Z')
      const endDate = new Date('2026-01-08T00:00:00.000Z')
      mockNitroHealth.readWorkouts.mockResolvedValue([
        {
          startTimeMs: startDate.getTime(),
          endTimeMs: endDate.getTime(),
          durationSeconds: 1800,
          activityType: 'yoga',
        },
      ])

      const result = await NitroHealth.readWorkouts({ startDate, endDate })

      expect(result[0].activityType).toBe('yoga')
      expect(result[0].title).toBeUndefined()
      expect(result[0].source).toBeUndefined()
      expect(result[0].totalDistanceMeters).toBeUndefined()
      expect(result[0].totalEnergyBurnedKcal).toBeUndefined()
    })

    it('rejects an invalid date range without crossing the bridge', async () => {
      const startDate = new Date('2026-01-08T00:00:00.000Z')
      const endDate = new Date('2026-01-01T00:00:00.000Z')

      await expect(NitroHealth.readWorkouts({ startDate, endDate })).rejects.toThrow(
        'startDate must be before endDate'
      )
      expect(mockNitroHealth.readWorkouts).not.toHaveBeenCalled()
    })
  })

  describe('readStatistics', () => {
    it("rejects the 'workout' data type without crossing the bridge", async () => {
      const startDate = new Date('2026-01-01T00:00:00.000Z')
      const endDate = new Date('2026-01-08T00:00:00.000Z')

      await expect(
        NitroHealth.readStatistics('workout', {
          startDate,
          endDate,
          bucket: 'day',
          metrics: ['sum'],
        })
      ).rejects.toThrow("readStatistics does not support the 'workout' data type")
      expect(mockNitroHealth.readStatistics).not.toHaveBeenCalled()
    })
  })
})
