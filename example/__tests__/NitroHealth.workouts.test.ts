import { mockNitroHealth, nativeRecordMetadata } from './support/mockNitroHealth'

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
      mockNitroHealth.readWorkouts.mockResolvedValue({
        samples: [
          {
            ...nativeRecordMetadata('workout-record-1', 'com.example.watch', 'Example Watch'),
            startTimeMs: workoutStartMs,
            endTimeMs: workoutEndMs,
            elapsedDurationSeconds: 2700,
            activeDuration: { status: 'available', value: 2580 },
            activity: {
              status: 'known',
              type: 'running',
              portability: 'portable',
              mapping: 'exact',
            },
            title: 'Morning Run',
            brandName: 'Example Fitness',
            totalDistance: { status: 'available', value: 7500 },
            totalActiveEnergyBurned: { status: 'available', value: 512.5 },
          },
        ],
      })

      const result = await NitroHealth.readWorkouts({ startDate, endDate })

      expect(mockNitroHealth.readWorkouts).toHaveBeenCalledWith({
        startTimeMs: startDate.getTime(),
        endTimeMs: endDate.getTime(),
        limit: 1000,
        ascending: true,
      })
      expect(result.samples).toHaveLength(1)
      expect(result.samples[0].identity).toEqual({ kind: 'record', id: 'workout-record-1' })
      expect(result.samples[0].origin).toEqual({
        identifier: 'com.example.watch',
        displayName: 'Example Watch',
      })
      expect(result.samples[0].startDate).toBeInstanceOf(Date)
      expect(result.samples[0].startDate.getTime()).toBe(workoutStartMs)
      expect(result.samples[0].endDate).toBeInstanceOf(Date)
      expect(result.samples[0].endDate.getTime()).toBe(workoutEndMs)
      expect(result.samples[0].elapsedDurationSeconds).toBe(2700)
      expect(result.samples[0].activeDuration).toEqual({ status: 'available', value: 2580 })
      expect(result.samples[0].activity).toEqual({
        status: 'known',
        type: 'running',
        portability: 'portable',
        mapping: 'exact',
      })
      expect(result.samples[0].title).toBe('Morning Run')
      expect(result.samples[0].brandName).toBe('Example Fitness')
      expect(result.samples[0].totalDistance).toEqual({ status: 'available', value: 7500 })
      expect(result.samples[0].totalActiveEnergyBurned).toEqual({
        status: 'available',
        value: 512.5,
      })
    })

    it('forwards explicit limit and ascending options', async () => {
      const startDate = new Date('2026-01-01T00:00:00.000Z')
      const endDate = new Date('2026-01-08T00:00:00.000Z')
      mockNitroHealth.readWorkouts.mockResolvedValue({ samples: [] })

      await NitroHealth.readWorkouts({ startDate, endDate, limit: 20, ascending: false })

      expect(mockNitroHealth.readWorkouts).toHaveBeenCalledWith({
        startTimeMs: startDate.getTime(),
        endTimeMs: endDate.getTime(),
        limit: 20,
        ascending: false,
      })
    })

    it('preserves unknown activity and unavailable metric states', async () => {
      const startDate = new Date('2026-01-01T00:00:00.000Z')
      const endDate = new Date('2026-01-08T00:00:00.000Z')
      mockNitroHealth.readWorkouts.mockResolvedValue({
        samples: [
          {
            ...nativeRecordMetadata('workout-record-1'),
            startTimeMs: startDate.getTime(),
            endTimeMs: endDate.getTime(),
            elapsedDurationSeconds: 1800,
            activeDuration: { status: 'notReported' },
            activity: { status: 'unknown' },
            totalDistance: { status: 'unsupported' },
            totalActiveEnergyBurned: { status: 'notReported' },
          },
        ],
      })

      const result = await NitroHealth.readWorkouts({ startDate, endDate })

      expect(result.samples[0].activity).toEqual({ status: 'unknown' })
      expect(result.samples[0].activeDuration).toEqual({ status: 'not-reported' })
      expect(result.samples[0].totalDistance).toEqual({ status: 'unsupported' })
      expect(result.samples[0].totalActiveEnergyBurned).toEqual({ status: 'not-reported' })
      expect(result.samples[0].title).toBeUndefined()
      expect(result.samples[0].brandName).toBeUndefined()
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

  describe('saveWorkout', () => {
    const startDate = new Date('2026-01-02T07:00:00.000Z')
    const endDate = new Date('2026-01-02T07:45:00.000Z')

    it('maps a portable workout through the Nitro hybrid object', async () => {
      mockNitroHealth.saveWorkout.mockResolvedValue({
        storedRecordingMethods: ['automaticallyRecorded'],
      })

      await expect(
        NitroHealth.saveWorkout({
          startDate,
          endDate,
          activityType: 'running',
          displayName: 'Morning Run',
          timeZone: 'America/New_York',
          recordingMethod: 'manual',
          sync: { id: 'workout-1', version: 2 },
        })
      ).resolves.toEqual({
        status: 'completed',
        storedRecordingMethods: ['automatically-recorded'],
      })

      expect(mockNitroHealth.saveWorkout).toHaveBeenCalledWith({
        startTimeMs: startDate.getTime(),
        endTimeMs: endDate.getTime(),
        activityType: 'running',
        displayName: 'Morning Run',
        timeZone: 'America/New_York',
        recordingMethod: 'manual',
        syncId: 'workout-1',
        syncVersion: 2,
      })
    })

    it('rejects invalid dates and intervals before crossing native', async () => {
      await expect(
        NitroHealth.saveWorkout({
          startDate: new Date(Number.NaN),
          endDate,
          activityType: 'running',
        })
      ).rejects.toThrow('workout: a valid startDate is required')
      await expect(
        NitroHealth.saveWorkout({ startDate: endDate, endDate: startDate, activityType: 'running' })
      ).rejects.toThrow('workout: startDate must be before endDate')

      expect(mockNitroHealth.saveWorkout).not.toHaveBeenCalled()
    })

    it('rejects activities that cannot round-trip cross-platform', async () => {
      for (const activityType of ['archery', 'calisthenics', 'underwaterDiving']) {
        await expect(
          NitroHealth.saveWorkout({ startDate, endDate, activityType } as never)
        ).rejects.toThrow('activityType is not supported for cross-platform writes')
      }

      expect(mockNitroHealth.saveWorkout).not.toHaveBeenCalled()
    })

    it('rejects invalid optional strings and sync metadata', async () => {
      await expect(
        NitroHealth.saveWorkout({ startDate, endDate, activityType: 'running', displayName: '  ' })
      ).rejects.toThrow('workout: displayName must be a non-empty string when provided')
      await expect(
        NitroHealth.saveWorkout({ startDate, endDate, activityType: 'running', timeZone: '' })
      ).rejects.toThrow('workout: timeZone must be a non-empty IANA time-zone identifier')
      await expect(
        NitroHealth.saveWorkout({
          startDate,
          endDate,
          activityType: 'running',
          sync: { id: 'workout-1', version: -1 },
        })
      ).rejects.toThrow('workout: sync.version must be a non-negative safe integer')

      expect(mockNitroHealth.saveWorkout).not.toHaveBeenCalled()
    })
  })
})
