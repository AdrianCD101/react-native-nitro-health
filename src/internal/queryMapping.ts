import type { HealthDataType } from '../HealthDataType'
import type { HealthDateRangeQuery } from '../HealthDateRangeQuery'
import type { HealthStatisticsQuery } from '../HealthStatisticsQuery'
import type { HealthTimeRangeQuery } from '../HealthTimeRangeQuery'
import type { NativeHealthDateRangeQuery } from '../NativeHealthDateRangeQuery'
import type { NativeHealthStatisticsQuery } from '../NativeHealthStatisticsQuery'
import type { NativeHealthTimeRangeQuery } from '../NativeHealthTimeRangeQuery'
import type { StatisticsBucket } from '../StatisticsBucket'
import type { StatisticsMetric } from '../StatisticsMetric'
import { assertStartBeforeEnd, assertValidDate } from './validation'

export function makeTimeRange(query: { startDate: Date; endDate: Date }): {
  startTimeMs: number
  endTimeMs: number
} {
  const startTimeMs = assertValidDate(query.startDate, 'startDate')
  const endTimeMs = assertValidDate(query.endDate, 'endDate')

  assertStartBeforeEnd(startTimeMs, endTimeMs)

  return {
    startTimeMs,
    endTimeMs,
  }
}

export function makeNativeSampleQuery(query: HealthDateRangeQuery): NativeHealthDateRangeQuery {
  const { startTimeMs, endTimeMs } = makeTimeRange(query)
  const limit = query.limit ?? 1000

  if (!Number.isInteger(limit) || limit <= 0) {
    throw new Error('limit must be a positive integer')
  }

  if (query.cursor !== undefined && (typeof query.cursor !== 'string' || query.cursor === '')) {
    throw new Error('cursor must be a non-empty string')
  }

  return {
    startTimeMs,
    endTimeMs,
    limit,
    ascending: query.ascending ?? true,
    ...(query.cursor !== undefined ? { cursor: query.cursor } : {}),
  }
}

export function makeNativeTimeRangeQuery(query: HealthTimeRangeQuery): NativeHealthTimeRangeQuery {
  const { startTimeMs, endTimeMs } = makeTimeRange(query)

  return {
    startTimeMs,
    endTimeMs,
  }
}

const STATISTICS_BUCKETS: readonly StatisticsBucket[] = ['hour', 'day', 'week', 'month']

const STATISTICS_METRICS_BY_DATA_TYPE: Record<HealthDataType, readonly StatisticsMetric[]> = {
  steps: ['sum'],
  distance: ['sum'],
  activeEnergyBurned: ['sum'],
  heartRate: ['avg', 'min', 'max'],
  bloodPressure: [],
  bloodGlucose: [],
  restingHeartRate: ['avg', 'min', 'max'],
  heartRateVariability: [],
  oxygenSaturation: [],
  height: ['avg', 'min', 'max'],
  bodyMass: ['avg', 'min', 'max'],
  sleep: [],
  workout: [],
}

const STATISTICS_METRICS: readonly StatisticsMetric[] = Array.from(
  new Set(Object.values(STATISTICS_METRICS_BY_DATA_TYPE).flat())
)

export function makeNativeStatisticsQuery(
  dataType: HealthDataType,
  query: HealthStatisticsQuery
): NativeHealthStatisticsQuery {
  const { startTimeMs, endTimeMs } = makeTimeRange(query)

  if (!STATISTICS_BUCKETS.includes(query.bucket)) {
    throw new Error('bucket must be one of: hour, day, week, month')
  }

  if (query.metrics.length === 0) {
    throw new Error('At least one metric is required')
  }

  const metrics = Array.from(new Set(query.metrics))

  for (const metric of metrics) {
    if (!STATISTICS_METRICS.includes(metric)) {
      throw new Error(`Unsupported statistics metric: ${metric}`)
    }
  }

  const supportedMetrics = STATISTICS_METRICS_BY_DATA_TYPE[dataType]

  if (supportedMetrics.length === 0) {
    throw new Error(`readStatistics does not support the '${dataType}' data type`)
  }

  for (const metric of metrics) {
    if (!supportedMetrics.includes(metric)) {
      throw new Error(
        `Metric '${metric}' is not supported for '${dataType}' (supported: ${supportedMetrics.join(', ')})`
      )
    }
  }

  return {
    startTimeMs,
    endTimeMs,
    bucket: query.bucket,
    metrics,
  }
}
