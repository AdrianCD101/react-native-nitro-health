import { describe, expect, it } from 'react-native-harness'
import { NitroHealth } from 'react-native-nitro-health'
import type { HealthStatistics, StatisticsMetric } from 'react-native-nitro-health'

import {
  emptyRange,
  hasVerifiedPermissions,
  heartRateReadPermission,
  isInconclusiveRead,
  last7DaysRange,
  lastDayRange,
  saveInterval,
  saveReadRange,
  stepsReadPermission,
} from './support/harnessSupport'

const statisticsMetricKeys = ['sum', 'avg', 'min', 'max'] as const

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
    try {
      const statistics = await NitroHealth.readHeartRateStatistics(emptyRange)

      for (const value of [statistics.average, statistics.min, statistics.max]) {
        expect(['number', 'undefined']).toContain(typeof value)
      }
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('rejects reading heart rate statistics when permission is reported not granted', async () => {
    const result = await NitroHealth.getPermissionStatuses(heartRateReadPermission)
    if (
      result.status === 'unavailable' ||
      !result.statuses.some(({ status }) => status === 'notGranted')
    ) {
      return
    }

    await expect(NitroHealth.readHeartRateStatistics(emptyRange)).rejects.toThrow(/permission/i)
  })

  describe('readStatistics', () => {
    it('reads statistics from native code without crashing', async () => {
      try {
        const dailySteps = await NitroHealth.readStatistics('steps', {
          ...last7DaysRange,
          bucket: 'day',
          metrics: ['sum'],
        })

        expect(Array.isArray(dailySteps)).toBe(true)
        for (const entry of dailySteps) {
          assertStatisticsEntry(entry, ['sum'])
        }
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
      }

      try {
        const hourlyHeartRate = await NitroHealth.readStatistics('heartRate', {
          ...lastDayRange,
          bucket: 'hour',
          metrics: ['avg', 'min', 'max'],
        })

        expect(Array.isArray(hourlyHeartRate)).toBe(true)
        for (const entry of hourlyHeartRate) {
          assertStatisticsEntry(entry, ['avg', 'min', 'max'])
        }
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
      }

      try {
        const dailyRestingHeartRate = await NitroHealth.readStatistics('restingHeartRate', {
          ...last7DaysRange,
          bucket: 'day',
          metrics: ['avg', 'min', 'max'],
        })

        expect(Array.isArray(dailyRestingHeartRate)).toBe(true)
        for (const entry of dailyRestingHeartRate) {
          assertStatisticsEntry(entry, ['avg', 'min', 'max'])
        }
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
      }

      try {
        const dailyHeight = await NitroHealth.readStatistics('height', {
          ...last7DaysRange,
          bucket: 'day',
          metrics: ['avg', 'min', 'max'],
        })

        expect(Array.isArray(dailyHeight)).toBe(true)
        for (const entry of dailyHeight) {
          assertStatisticsEntry(entry, ['avg', 'min', 'max'])
        }
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
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

    it('rejects reading statistics when steps permission is reported not granted', async () => {
      const result = await NitroHealth.getPermissionStatuses(stepsReadPermission)
      if (
        result.status === 'unavailable' ||
        !result.statuses.some(({ status }) => status === 'notGranted')
      ) {
        return
      }

      await expect(
        NitroHealth.readStatistics('steps', { ...emptyRange, bucket: 'day', metrics: ['sum'] })
      ).rejects.toThrow(/permission/i)
    })

    it('round-trips saved steps through readStatistics when authorized', async () => {
      const authorized = await hasVerifiedPermissions([
        { accessType: 'write', dataType: 'steps' },
        { accessType: 'read', dataType: 'steps' },
      ])

      if (!authorized) {
        return
      }

      await NitroHealth.saveSteps([{ ...saveInterval, count: 321 }])

      const buckets = await NitroHealth.readStatistics('steps', {
        startDate: saveReadRange.startDate,
        endDate: saveReadRange.endDate,
        bucket: 'day',
        metrics: ['sum'],
      })

      if (isInconclusiveRead(buckets)) {
        return
      }

      expect(buckets.some((bucket) => (bucket.sum ?? 0) >= 321)).toBe(true)
    })
  })
})
