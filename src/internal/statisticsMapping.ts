import type { HealthStatistics } from '../HealthStatistics'
import type { HealthStatisticsByDataType } from '../HealthStatisticsByDataType'
import type { HealthStatisticsDataType } from '../HealthDataType'
import type { HeartRateStatistics } from '../HeartRateStatistics'
import type { NativeHealthStatistics } from '../NativeHealthStatistics'
import type { NativeHeartRateStatistics } from '../NativeHeartRateStatistics'
import { makeDistanceScope } from './sampleOutputMapping'

export function makeHeartRateStatistics(
  statistics: NativeHeartRateStatistics
): HeartRateStatistics {
  return {
    average: statistics.average,
    min: statistics.min,
    max: statistics.max,
  }
}

export function makeHealthStatistics<T extends HealthStatisticsDataType>(
  dataType: T,
  statistics: NativeHealthStatistics
): HealthStatisticsByDataType<T> {
  if (statistics.timeZone === undefined) {
    throw new Error('Native statistics are missing timeZone')
  }

  const result: HealthStatistics = {
    startDate: new Date(statistics.startTimeMs),
    endDate: new Date(statistics.endTimeMs),
    sum: statistics.sum,
    avg: statistics.avg,
    min: statistics.min,
    max: statistics.max,
    duration: statistics.duration,
    timeZone: statistics.timeZone,
  }

  if (dataType === 'distance') {
    if (statistics.scope === undefined) {
      throw new Error('Native distance statistics are missing scope')
    }
    // SAFETY: distance is the only data type whose statistics contract adds scope.
    return {
      ...result,
      scope: makeDistanceScope(statistics.scope),
    } as HealthStatisticsByDataType<T>
  }

  if (statistics.scope !== undefined) {
    throw new Error(`Native '${dataType}' statistics unexpectedly contain distance scope`)
  }
  // SAFETY: all non-distance statistics contracts are represented by the validated base result.
  return result as HealthStatisticsByDataType<T>
}
