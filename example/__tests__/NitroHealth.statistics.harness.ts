import { describe, expect, it } from 'react-native-harness'
import { NitroHealth } from 'react-native-nitro-health'
import type { HealthStatistics, StatisticsMetric } from 'react-native-nitro-health'

import { Platform } from 'react-native'

import {
  activeEnergyReadPermission,
  activeEnergyWritePermission,
  basalEnergyReadPermission,
  emptyRange,
  floorsClimbedReadPermission,
  floorsClimbedWritePermission,
  hydrationReadPermission,
  hydrationWritePermission,
  hasVerifiedPermissions,
  last7DaysRange,
  lastDayRange,
  nutritionReadPermission,
  nutritionWritePermission,
  totalEnergyReadPermission,
} from './support/harnessSupport'

const statisticsMetricKeys = ['sum', 'avg', 'min', 'max', 'duration'] as const
const statisticsRangeEnd = Date.now() - 60 * 60 * 1000
const statisticsRange = {
  startDate: new Date(statisticsRangeEnd - 48 * 60 * 60 * 1000),
  endDate: new Date(statisticsRangeEnd),
}
const statisticsInterval = {
  startDate: new Date(statisticsRangeEnd - 6 * 60 * 60 * 1000),
  endDate: new Date(statisticsRangeEnd - 5.5 * 60 * 60 * 1000),
}

function sumStatistics(buckets: readonly HealthStatistics[]): number {
  return buckets.reduce((sum, bucket) => sum + (bucket.sum ?? 0), 0)
}

// Health Connect only counts aggregates (steps, floors, energy, sleep and exercise
// durations) for apps on the user-managed priority list — and that list is per category
// (Activity, Sleep, ...), so steps visibility says nothing about sleep visibility. A real
// permission grant (local dev) registers the app on the category's list, but Harness
// provisions CI emulators with `pm grant`, which skips that flow — so the same aggregate
// query deterministically includes this app's writes locally and deterministically excludes
// them in CI. Probe each category once per run, using a dedicated 2003 date island
// (2000/2001/2002/2004/2005/2006 belong to other fixtures) and permissions every caller of
// the round-trip helper already holds. iOS aggregation has no priority list, so it always
// sees the app.
const aggregationProbeInterval = {
  startDate: new Date('2003-06-01T09:00:00.000Z'),
  endDate: new Date('2003-06-01T09:30:00.000Z'),
}
const aggregationProbeRange = {
  startDate: new Date('2003-06-01T00:00:00.000Z'),
  endDate: new Date('2003-06-02T00:00:00.000Z'),
}

const aggregationVisibilityByProbe = new Map<string, Promise<boolean>>()

function probeAggregationVisibility(key: string, probe: () => Promise<boolean>): Promise<boolean> {
  if (Platform.OS === 'ios') {
    return Promise.resolve(true)
  }
  let visibility = aggregationVisibilityByProbe.get(key)
  if (visibility === undefined) {
    visibility = probe()
    aggregationVisibilityByProbe.set(key, visibility)
  }
  return visibility
}

function isActivityAggregationVisible(): Promise<boolean> {
  return probeAggregationVisibility('steps', async () => {
    await NitroHealth.deleteRecordsByTimeRange('steps', aggregationProbeRange)
    try {
      await NitroHealth.saveSteps([
        {
          ...aggregationProbeInterval,
          count: 1,
          sync: { id: 'nitro-health-harness-aggregation-probe', version: 1 },
        },
      ])
      const query = { ...aggregationProbeRange, bucket: 'day' as const, metrics: ['sum' as const] }
      return sumStatistics(await NitroHealth.readStatistics('steps', query)) >= 1
    } finally {
      await NitroHealth.deleteRecordsByTimeRange('steps', aggregationProbeRange)
    }
  })
}

function sumDurations(buckets: readonly HealthStatistics[]): number {
  return buckets.reduce((sum, bucket) => sum + (bucket.duration ?? 0), 0)
}

// A stage-less probe session counts its full length in SLEEP_DURATION_TOTAL,
// so any positive duration proves the Sleep category can see this app.
function isSleepAggregationVisible(): Promise<boolean> {
  return probeAggregationVisibility('sleep', async () => {
    await NitroHealth.deleteRecordsByTimeRange('sleep', aggregationProbeRange)
    try {
      await NitroHealth.saveSleepSessions([
        {
          ...aggregationProbeInterval,
          sync: { id: 'nitro-health-harness-sleep-aggregation-probe', version: 1 },
        },
      ])
      const query = {
        ...aggregationProbeRange,
        bucket: 'day' as const,
        metrics: ['duration' as const],
      }
      return sumDurations(await NitroHealth.readStatistics('sleep', query)) >= 1
    } finally {
      await NitroHealth.deleteRecordsByTimeRange('sleep', aggregationProbeRange)
    }
  })
}

function isWorkoutAggregationVisible(): Promise<boolean> {
  return probeAggregationVisibility('workout', async () => {
    await NitroHealth.deleteRecordsByTimeRange('workout', aggregationProbeRange)
    try {
      await NitroHealth.saveWorkout({
        ...aggregationProbeInterval,
        activityType: 'walking',
        sync: { id: 'nitro-health-harness-workout-aggregation-probe', version: 1 },
      })
      const query = {
        ...aggregationProbeRange,
        bucket: 'day' as const,
        metrics: ['duration' as const],
      }
      return sumDurations(await NitroHealth.readStatistics('workout', query)) >= 1
    } finally {
      await NitroHealth.deleteRecordsByTimeRange('workout', aggregationProbeRange)
    }
  })
}

// Writes are committed before the save promise resolves on both platforms, so every assertion
// here is a single deterministic read — no polling. Record visibility is asserted everywhere;
// the aggregate sum is asserted wherever aggregation can see this app (iOS always, Android only
// when the app is on the queried category's priority list).
async function expectActivityRoundTrip(options: {
  readAggregate: () => Promise<number>
  aggregateTarget: number
  hasSavedRecord: () => Promise<boolean>
  isAggregationVisible?: () => Promise<boolean>
}): Promise<void> {
  expect(await options.hasSavedRecord()).toBe(true)
  const isVisible = options.isAggregationVisible ?? isActivityAggregationVisible
  if (await isVisible()) {
    expect(await options.readAggregate()).toBeGreaterThanOrEqual(options.aggregateTarget - 0.001)
  }
}

function assertStatisticsEntry(
  entry: HealthStatistics,
  metrics: readonly StatisticsMetric[]
): void {
  expect(entry.startDate).toBeInstanceOf(Date)
  expect(entry.endDate).toBeInstanceOf(Date)
  expect(entry.startDate.getTime()).toBeLessThan(entry.endDate.getTime())
  // Every bucket echoes the resolved zone — the device zone when the query omitted one.
  expect(typeof entry.timeZone).toBe('string')
  expect(entry.timeZone.length).toBeGreaterThan(0)

  for (const key of statisticsMetricKeys) {
    if (metrics.includes(key)) {
      expect(['number', 'undefined']).toContain(typeof entry[key])
    } else {
      expect(entry[key]).toBeUndefined()
    }
  }
}

describe('NitroHealth statistics (native)', () => {
  it('reads heart rate statistics from native code without crashing', async () => {
    const statistics = await NitroHealth.readHeartRateStatistics(emptyRange)

    for (const value of [statistics.average, statistics.min, statistics.max]) {
      expect(['number', 'undefined']).toContain(typeof value)
    }
  })

  describe('readStatistics', () => {
    it('reads statistics from native code without crashing', async () => {
      const dailySteps = await NitroHealth.readStatistics('steps', {
        ...last7DaysRange,
        bucket: 'day',
        metrics: ['sum'],
      })

      expect(Array.isArray(dailySteps)).toBe(true)
      for (const entry of dailySteps) {
        assertStatisticsEntry(entry, ['sum'])
      }

      const hourlyHeartRate = await NitroHealth.readStatistics('heartRate', {
        ...lastDayRange,
        bucket: 'hour',
        metrics: ['avg', 'min', 'max'],
      })

      expect(Array.isArray(hourlyHeartRate)).toBe(true)
      for (const entry of hourlyHeartRate) {
        assertStatisticsEntry(entry, ['avg', 'min', 'max'])
      }

      const dailyRestingHeartRate = await NitroHealth.readStatistics('restingHeartRate', {
        ...last7DaysRange,
        bucket: 'day',
        metrics: ['avg', 'min', 'max'],
      })

      expect(Array.isArray(dailyRestingHeartRate)).toBe(true)
      for (const entry of dailyRestingHeartRate) {
        assertStatisticsEntry(entry, ['avg', 'min', 'max'])
      }

      const dailyHeight = await NitroHealth.readStatistics('height', {
        ...last7DaysRange,
        bucket: 'day',
        metrics: ['avg', 'min', 'max'],
      })

      expect(Array.isArray(dailyHeight)).toBe(true)
      for (const entry of dailyHeight) {
        assertStatisticsEntry(entry, ['avg', 'min', 'max'])
      }
    })

    it('rejects unsupported metric/data-type combinations and invalid inputs before crossing the native boundary', async () => {
      await expect(
        NitroHealth.readStatistics('heartRate', {
          ...emptyRange,
          bucket: 'day',
          metrics: ['sum'],
        })
      ).rejects.toThrow(`Metric 'sum' is not supported for 'heartRate' (supported: avg, min, max)`)

      await expect(
        NitroHealth.readStatistics('steps', {
          ...emptyRange,
          bucket: 'day',
          metrics: ['avg'],
        })
      ).rejects.toThrow(`Metric 'avg' is not supported for 'steps' (supported: sum)`)

      await expect(
        NitroHealth.readStatistics('sleep', {
          ...emptyRange,
          bucket: 'day',
          metrics: ['sum'],
        })
      ).rejects.toThrow(`Metric 'sum' is not supported for 'sleep' (supported: duration)`)

      // HRV and SpO2 have no aggregate metrics on either platform (Android physically cannot
      // aggregate them; see HeartRateVariabilitySample/OxygenSaturationSample), so both are
      // rejected in JS before any native call — use readHeartRateVariability/readOxygenSaturation
      // instead.
      await expect(
        NitroHealth.readStatistics('heartRateVariability', {
          ...emptyRange,
          bucket: 'day',
          metrics: ['avg'],
        })
      ).rejects.toThrow(`readStatistics does not support the 'heartRateVariability' data type`)

      await expect(
        NitroHealth.readStatistics('oxygenSaturation', {
          ...emptyRange,
          bucket: 'day',
          metrics: ['avg'],
        })
      ).rejects.toThrow(`readStatistics does not support the 'oxygenSaturation' data type`)

      await expect(
        NitroHealth.readStatistics('steps', {
          ...emptyRange,
          bucket: 'day',
          metrics: [],
        })
      ).rejects.toThrow('At least one metric is required')

      await expect(
        NitroHealth.readStatistics('steps', {
          ...emptyRange,
          bucket: 'year' as any,
          metrics: ['sum'],
        })
      ).rejects.toThrow('bucket must be one of: hour, day, week, month')
    })

    it('rejects an invalid IANA time zone natively, including for hour buckets', async () => {
      for (const bucket of ['hour', 'day'] as const) {
        await expect(
          NitroHealth.readStatistics('steps', {
            ...emptyRange,
            bucket,
            metrics: ['sum'],
            timeZone: 'Not/A_Zone',
          })
        ).rejects.toThrow('timeZone is not a valid IANA time-zone identifier')

        // Fixed-offset strings are deliberately rejected; only real IANA identifiers resolve.
        await expect(
          NitroHealth.readStatistics('steps', {
            ...emptyRange,
            bucket,
            metrics: ['sum'],
            timeZone: '+01:00',
          })
        ).rejects.toThrow('timeZone is not a valid IANA time-zone identifier')
      }
    })

    // America/New_York day buckets around the DST transitions: 2026-03-08 (spring forward) has
    // 23 hours and 2025-11-02 (fall back) has 25. Both dates are in the past so the samples are
    // writable, and each range is a dedicated island that is cleared before and after.
    it('computes day buckets in an explicit non-device zone across DST boundaries', async () => {
      const authorized = await hasVerifiedPermissions([
        { accessType: 'write', dataType: 'steps' },
        { accessType: 'read', dataType: 'steps' },
      ])

      if (!authorized || !(await isActivityAggregationVisible())) {
        return
      }

      // Local midnights in America/New_York: 2026-03-08T00:00 is 05:00Z (EST, -5); after the
      // shift 2026-03-09T00:00 and 2026-03-10T00:00 are 04:00Z (EDT, -4).
      const springRange = {
        startDate: new Date('2026-03-08T05:00:00.000Z'),
        endDate: new Date('2026-03-10T04:00:00.000Z'),
      }
      // 2025-11-02T00:00 is 04:00Z (EDT, -4); 2025-11-03T00:00 is 05:00Z (EST, -5).
      const fallRange = {
        startDate: new Date('2025-11-02T04:00:00.000Z'),
        endDate: new Date('2025-11-03T05:00:00.000Z'),
      }
      const hour = 60 * 60 * 1000

      await NitroHealth.deleteRecordsByTimeRange('steps', springRange)
      await NitroHealth.deleteRecordsByTimeRange('steps', fallRange)
      try {
        await NitroHealth.saveSteps([
          {
            startDate: new Date('2026-03-08T12:00:00.000Z'),
            endDate: new Date('2026-03-08T12:30:00.000Z'),
            count: 11,
            sync: { id: 'nitro-health-harness-dst-spring-day-1', version: 1 },
          },
          {
            startDate: new Date('2026-03-09T12:00:00.000Z'),
            endDate: new Date('2026-03-09T12:30:00.000Z'),
            count: 22,
            sync: { id: 'nitro-health-harness-dst-spring-day-2', version: 1 },
          },
          {
            startDate: new Date('2025-11-02T12:00:00.000Z'),
            endDate: new Date('2025-11-02T12:30:00.000Z'),
            count: 33,
            sync: { id: 'nitro-health-harness-dst-fall', version: 1 },
          },
        ])

        const springBuckets = await NitroHealth.readStatistics('steps', {
          ...springRange,
          bucket: 'day',
          metrics: ['sum'],
          timeZone: 'America/New_York',
        })

        expect(springBuckets).toHaveLength(2)
        for (const bucket of springBuckets) {
          expect(bucket.timeZone).toBe('America/New_York')
        }
        // The bucket containing the spring-forward shift spans 23 physical hours.
        expect(springBuckets[0].startDate.getTime()).toBe(springRange.startDate.getTime())
        expect(springBuckets[0].endDate.getTime() - springBuckets[0].startDate.getTime()).toBe(
          23 * hour
        )
        expect(springBuckets[0].sum).toBe(11)
        expect(springBuckets[1].endDate.getTime() - springBuckets[1].startDate.getTime()).toBe(
          24 * hour
        )
        expect(springBuckets[1].sum).toBe(22)

        const fallBuckets = await NitroHealth.readStatistics('steps', {
          ...fallRange,
          bucket: 'day',
          metrics: ['sum'],
          timeZone: 'America/New_York',
        })

        // The bucket containing the fall-back shift spans 25 physical hours.
        expect(fallBuckets).toHaveLength(1)
        expect(fallBuckets[0].timeZone).toBe('America/New_York')
        expect(fallBuckets[0].endDate.getTime() - fallBuckets[0].startDate.getTime()).toBe(
          25 * hour
        )
        expect(fallBuckets[0].sum).toBe(33)
      } finally {
        await NitroHealth.deleteRecordsByTimeRange('steps', springRange)
        await NitroHealth.deleteRecordsByTimeRange('steps', fallRange)
      }
    })

    it('round-trips saved steps through readStatistics when authorized', async () => {
      const authorized = await hasVerifiedPermissions([
        { accessType: 'write', dataType: 'steps' },
        { accessType: 'read', dataType: 'steps' },
      ])

      if (!authorized) {
        return
      }

      await NitroHealth.deleteRecordsByTimeRange('steps', statisticsRange)
      try {
        const query = { ...statisticsRange, bucket: 'day' as const, metrics: ['sum' as const] }
        const baseline = sumStatistics(await NitroHealth.readStatistics('steps', query))

        await NitroHealth.saveSteps([
          {
            ...statisticsInterval,
            count: 321,
            sync: { id: 'nitro-health-harness-steps-statistics', version: 1 },
          },
        ])

        await expectActivityRoundTrip({
          readAggregate: async () =>
            sumStatistics(await NitroHealth.readStatistics('steps', query)),
          aggregateTarget: baseline + 321,
          hasSavedRecord: async () =>
            (await NitroHealth.readSteps(statisticsRange)).samples.some(
              (sample) => sample.count === 321
            ),
        })
      } finally {
        await NitroHealth.deleteRecordsByTimeRange('steps', statisticsRange)
      }
    })

    it('round-trips saved floors climbed through readStatistics when authorized', async () => {
      if (
        !(await hasVerifiedPermissions([
          ...floorsClimbedReadPermission,
          ...floorsClimbedWritePermission,
        ]))
      ) {
        return
      }

      await NitroHealth.deleteRecordsByTimeRange('floorsClimbed', statisticsRange)
      try {
        const query = { ...statisticsRange, bucket: 'day' as const, metrics: ['sum' as const] }
        const baseline = sumStatistics(await NitroHealth.readStatistics('floorsClimbed', query))

        await NitroHealth.saveFloorsClimbed([
          {
            ...statisticsInterval,
            floors: 12.5,
            sync: { id: 'nitro-health-harness-floors-statistics', version: 1 },
          },
        ])

        await expectActivityRoundTrip({
          readAggregate: async () =>
            sumStatistics(await NitroHealth.readStatistics('floorsClimbed', query)),
          aggregateTarget: baseline + 12.5,
          hasSavedRecord: async () =>
            (await NitroHealth.readFloorsClimbed(statisticsRange)).samples.some(
              (sample) => Math.abs(sample.floors - 12.5) < 0.001
            ),
        })
      } finally {
        await NitroHealth.deleteRecordsByTimeRange('floorsClimbed', statisticsRange)
      }
    })

    it('round-trips saved hydration through readStatistics when authorized', async () => {
      if (
        !(await hasVerifiedPermissions([...hydrationReadPermission, ...hydrationWritePermission]))
      ) {
        return
      }

      await NitroHealth.deleteRecordsByTimeRange('hydration', statisticsRange)
      try {
        const query = { ...statisticsRange, bucket: 'day' as const, metrics: ['sum' as const] }
        const baseline = sumStatistics(await NitroHealth.readStatistics('hydration', query))

        await NitroHealth.saveHydration([
          {
            ...statisticsInterval,
            milliliters: 375.5,
            sync: { id: 'nitro-health-harness-hydration-statistics', version: 1 },
          },
        ])

        expect(
          sumStatistics(await NitroHealth.readStatistics('hydration', query))
        ).toBeGreaterThanOrEqual(baseline + 375.5 - 0.001)
      } finally {
        await NitroHealth.deleteRecordsByTimeRange('hydration', statisticsRange)
      }
    })

    it('round-trips saved nutrition through per-nutrient statistics when authorized', async () => {
      if (
        !(await hasVerifiedPermissions([...nutritionReadPermission, ...nutritionWritePermission]))
      ) {
        return
      }

      await NitroHealth.deleteRecordsByTimeRange('nutrition', statisticsRange)
      try {
        const query = { ...statisticsRange, bucket: 'day' as const, metrics: ['sum' as const] }
        const proteinBaseline = sumStatistics(
          await NitroHealth.readStatistics('nutritionProtein', query)
        )
        const energyBaseline = sumStatistics(
          await NitroHealth.readStatistics('nutritionEnergyConsumed', query)
        )
        const sodiumBaseline = sumStatistics(
          await NitroHealth.readStatistics('nutritionSodium', query)
        )

        await NitroHealth.saveNutrition([
          {
            ...statisticsInterval,
            foodName: 'Harness statistics meal',
            energyKilocalories: 640,
            proteinGrams: 42,
            sync: { id: 'nitro-health-harness-nutrition-statistics', version: 1 },
          },
        ])

        expect(
          sumStatistics(await NitroHealth.readStatistics('nutritionProtein', query))
        ).toBeGreaterThanOrEqual(proteinBaseline + 42 - 0.001)
        expect(
          sumStatistics(await NitroHealth.readStatistics('nutritionEnergyConsumed', query))
        ).toBeGreaterThanOrEqual(energyBaseline + 640 - 0.001)
        // Sodium was not part of the saved entry, so its sums must not change.
        const sodiumAfterSave = sumStatistics(
          await NitroHealth.readStatistics('nutritionSodium', query)
        )
        expect(Math.abs(sodiumAfterSave - sodiumBaseline)).toBeLessThan(0.001)
      } finally {
        await NitroHealth.deleteRecordsByTimeRange('nutrition', statisticsRange)
      }
    })

    it('round-trips a saved sleep session through duration statistics when authorized', async () => {
      if (
        !(await hasVerifiedPermissions([
          { accessType: 'read', dataType: 'sleep' },
          { accessType: 'write', dataType: 'sleep' },
        ]))
      ) {
        return
      }

      // Dedicated 2005 date island (2000-2004/2006 belong to other fixtures).
      const sleepRange = {
        startDate: new Date('2005-06-01T00:00:00.000Z'),
        endDate: new Date('2005-06-03T00:00:00.000Z'),
      }
      await NitroHealth.deleteRecordsByTimeRange('sleep', sleepRange)
      try {
        // 8h session with a 30-minute awake gap: both platforms must report
        // 7.5h asleep (Android subtracts awake stages natively; iOS
        // union-merges the asleep stage intervals).
        await NitroHealth.saveSleepSessions([
          {
            startDate: new Date('2005-06-01T21:00:00.000Z'),
            endDate: new Date('2005-06-02T05:00:00.000Z'),
            stages: [
              {
                startDate: new Date('2005-06-01T21:00:00.000Z'),
                endDate: new Date('2005-06-02T01:00:00.000Z'),
                stage: 'asleepCore',
              },
              {
                startDate: new Date('2005-06-02T01:00:00.000Z'),
                endDate: new Date('2005-06-02T01:30:00.000Z'),
                stage: 'awake',
              },
              {
                startDate: new Date('2005-06-02T01:30:00.000Z'),
                endDate: new Date('2005-06-02T05:00:00.000Z'),
                stage: 'asleepDeep',
              },
            ],
            sync: { id: 'nitro-health-harness-sleep-statistics', version: 1 },
          },
        ])

        await expectActivityRoundTrip({
          readAggregate: async () => {
            const buckets = await NitroHealth.readStatistics('sleep', {
              ...sleepRange,
              bucket: 'day',
              metrics: ['duration'],
              timeZone: 'UTC',
            })
            for (const bucket of buckets) {
              assertStatisticsEntry(bucket, ['duration'])
            }
            return buckets.reduce((sum, bucket) => sum + (bucket.duration ?? 0), 0)
          },
          aggregateTarget: 7.5 * 3600,
          hasSavedRecord: async () =>
            (await NitroHealth.readSleepSamples({ ...sleepRange, limit: 1000 })).samples.some(
              (sample) => sample.kind === 'stage' && sample.stage === 'asleepDeep'
            ),
          isAggregationVisible: isSleepAggregationVisible,
        })
      } finally {
        await NitroHealth.deleteRecordsByTimeRange('sleep', sleepRange)
      }
    })

    it('round-trips a saved workout through duration statistics when authorized', async () => {
      if (
        !(await hasVerifiedPermissions([
          { accessType: 'read', dataType: 'workout' },
          { accessType: 'write', dataType: 'workout' },
        ]))
      ) {
        return
      }

      const workoutRange = {
        startDate: new Date('2005-07-01T00:00:00.000Z'),
        endDate: new Date('2005-07-02T00:00:00.000Z'),
      }
      await NitroHealth.deleteRecordsByTimeRange('workout', workoutRange)
      try {
        await NitroHealth.saveWorkout({
          startDate: new Date('2005-07-01T10:00:00.000Z'),
          endDate: new Date('2005-07-01T11:00:00.000Z'),
          activityType: 'walking',
          sync: { id: 'nitro-health-harness-workout-statistics', version: 1 },
        })

        await expectActivityRoundTrip({
          readAggregate: async () => {
            const buckets = await NitroHealth.readStatistics('workout', {
              ...workoutRange,
              bucket: 'day',
              metrics: ['duration'],
              timeZone: 'UTC',
            })
            for (const bucket of buckets) {
              assertStatisticsEntry(bucket, ['duration'])
            }
            return buckets.reduce((sum, bucket) => sum + (bucket.duration ?? 0), 0)
          },
          aggregateTarget: 3600,
          hasSavedRecord: async () =>
            (await NitroHealth.readWorkouts({ ...workoutRange, limit: 1000 })).samples.some(
              (workout) => workout.startDate.getTime() === Date.parse('2005-07-01T10:00:00.000Z')
            ),
          isAggregationVisible: isWorkoutAggregationVisible,
        })
      } finally {
        await NitroHealth.deleteRecordsByTimeRange('workout', workoutRange)
      }
    })

    it('reads basal energy statistics from native code without crashing', async () => {
      if (!(await hasVerifiedPermissions(basalEnergyReadPermission))) {
        return
      }

      const dailyBasalEnergy = await NitroHealth.readStatistics('basalEnergyBurned', {
        ...last7DaysRange,
        bucket: 'day',
        metrics: ['sum'],
      })

      expect(Array.isArray(dailyBasalEnergy)).toBe(true)
      for (const entry of dailyBasalEnergy) {
        assertStatisticsEntry(entry, ['sum'])
        expect(entry.sum ?? 0).toBeGreaterThanOrEqual(0)
      }
    })

    // Total energy has no HealthKit type: iOS composes active + basal and must omit buckets
    // whose basal half is missing, while Health Connect derives totals from components (plus a
    // metabolic-rate estimate) when no stored total-energy record covers the window. A saved
    // active-energy record on a date island with no basal data pins the iOS behavior; the
    // Android derivation is priority-filtered, so its value is asserted only where aggregation
    // can see the app (see expectActivityRoundTrip) and shape-checked elsewhere.
    it('composes total energy from components per platform policy', async () => {
      if (
        !(await hasVerifiedPermissions([
          ...activeEnergyReadPermission,
          ...activeEnergyWritePermission,
          ...totalEnergyReadPermission,
        ]))
      ) {
        return
      }

      const energyIslandRange = {
        startDate: new Date('2006-06-01T00:00:00.000Z'),
        endDate: new Date('2006-06-02T00:00:00.000Z'),
      }
      const energyIslandInterval = {
        startDate: new Date('2006-06-01T09:00:00.000Z'),
        endDate: new Date('2006-06-01T09:30:00.000Z'),
      }
      const query = { ...energyIslandRange, bucket: 'day' as const, metrics: ['sum' as const] }

      await NitroHealth.deleteRecordsByTimeRange('activeEnergyBurned', energyIslandRange)
      try {
        await NitroHealth.saveActiveEnergyBurned([
          {
            ...energyIslandInterval,
            kilocalories: 250,
            sync: { id: 'nitro-health-harness-total-energy-statistics', version: 1 },
          },
        ])

        await expectActivityRoundTrip({
          readAggregate: async () =>
            sumStatistics(await NitroHealth.readStatistics('activeEnergyBurned', query)),
          aggregateTarget: 250,
          hasSavedRecord: async () =>
            (await NitroHealth.readActiveEnergyBurned(energyIslandRange)).samples.some(
              (sample) => Math.abs(sample.kilocalories - 250) < 0.001
            ),
        })

        if (Platform.OS === 'ios') {
          // No basal data exists on this island, so no bucket may pose as a "total".
          expect(await NitroHealth.readStatistics('totalEnergyBurned', query)).toEqual([])
        } else if (await isActivityAggregationVisible()) {
          // With the app on the priority list, the derived total must cover the active
          // component we just saved.
          expect(
            sumStatistics(await NitroHealth.readStatistics('totalEnergyBurned', query))
          ).toBeGreaterThanOrEqual(250 - 0.001)
        } else {
          // Health Connect derives totals through the same priority-filtered Activity
          // aggregation (see expectActivityRoundTrip), so the composed value is unobservable
          // on a `pm grant`-provisioned emulator — assert only the bucket shape here.
          const totals = await NitroHealth.readStatistics('totalEnergyBurned', query)
          for (const entry of totals) {
            assertStatisticsEntry(entry, ['sum'])
          }
        }
      } finally {
        await NitroHealth.deleteRecordsByTimeRange('activeEnergyBurned', energyIslandRange)
      }
    })
  })
})
