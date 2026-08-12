import { describe, expect, it, waitUntil } from 'react-native-harness'
import { NitroHealth } from 'react-native-nitro-health'
import type { HealthStatistics, StatisticsMetric } from 'react-native-nitro-health'

import {
  emptyRange,
  floorsClimbedReadPermission,
  floorsClimbedWritePermission,
  hasVerifiedPermissions,
  last7DaysRange,
  lastDayRange,
} from './support/harnessSupport'

const statisticsMetricKeys = ['sum', 'avg', 'min', 'max'] as const
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

function assertStatisticsEntry(
  entry: HealthStatistics,
  metrics: readonly StatisticsMetric[]
): void {
  expect(entry.startDate).toBeInstanceOf(Date)
  expect(entry.endDate).toBeInstanceOf(Date)
  expect(entry.startDate.getTime()).toBeLessThan(entry.endDate.getTime())

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
      ).rejects.toThrow(`readStatistics does not support the 'sleep' data type`)

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

        await waitUntil(
          async () =>
            sumStatistics(await NitroHealth.readStatistics('steps', query)) >= baseline + 321,
          { interval: 250, timeout: 10_000 }
        )
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

        await waitUntil(
          async () =>
            sumStatistics(await NitroHealth.readStatistics('floorsClimbed', query)) >=
            baseline + 12.5 - 0.001,
          { interval: 250, timeout: 10_000 }
        )
      } finally {
        await NitroHealth.deleteRecordsByTimeRange('floorsClimbed', statisticsRange)
      }
    })
  })
})
