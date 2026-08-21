import type { HealthStatisticsDataType } from '../HealthDataType'
import type { HealthDateRangeQuery } from '../HealthDateRangeQuery'
import type { HealthStatisticsQuery } from '../HealthStatisticsQuery'
import type { HealthTimeRangeQuery } from '../HealthTimeRangeQuery'
import type { NativeHealthDateRangeQuery } from '../NativeHealthDateRangeQuery'
import type { NativeHealthStatisticsQuery } from '../NativeHealthStatisticsQuery'
import type { NativeHealthTimeRangeQuery } from '../NativeHealthTimeRangeQuery'
import type { StatisticsBucket } from '../StatisticsBucket'
import type { StatisticsMetric } from '../StatisticsMetric'
import { assertStartBeforeEnd, assertValidDate } from './validation'

export function makeTimeRange(query: { startDate: Date; endDate: Date }) {
  const startTimeMs = assertValidDate(query.startDate, 'startDate')
  const endTimeMs = assertValidDate(query.endDate, 'endDate')

  assertStartBeforeEnd(startTimeMs, endTimeMs)

  return {
    startTimeMs,
    endTimeMs,
  }
}

// Both platforms narrow the limit to a native integer: Swift's Int(Double)
// traps beyond Int64 range and Kotlin's Double.toInt() saturates at Int32
// max, so the boundary must reject anything a 32-bit page size can't hold.
const MAX_QUERY_LIMIT = 2_147_483_647

// Canonical form for an origin identifier list: validated, deduped, and sorted so that
// semantically identical filters serialize identically (pagination cursors bind the
// canonical list and compare it byte-for-byte). An empty list is rejected here because
// Health Connect treats an empty dataOriginFilter set as "no filter" — an empty include
// list must never silently widen a scoped read.
function canonicalizeOriginIdentifiers(identifiers: readonly string[]): string[] {
  if (identifiers.length === 0) {
    throw new Error('origins must contain at least one identifier')
  }

  for (const identifier of identifiers) {
    if (typeof identifier !== 'string' || identifier.trim() === '') {
      throw new Error('origins identifiers must be non-empty strings')
    }
  }

  return Array.from(new Set(identifiers)).sort()
}

export function makeNativeSampleQuery(query: HealthDateRangeQuery): NativeHealthDateRangeQuery {
  const { startTimeMs, endTimeMs } = makeTimeRange(query)
  const limit = query.limit ?? 1000

  if (!Number.isInteger(limit) || limit <= 0 || limit > MAX_QUERY_LIMIT) {
    throw new Error(`limit must be a positive integer no greater than ${MAX_QUERY_LIMIT}`)
  }

  if (query.cursor !== undefined && (typeof query.cursor !== 'string' || query.cursor === '')) {
    throw new Error('cursor must be a non-empty string')
  }

  const nativeQuery: NativeHealthDateRangeQuery = {
    startTimeMs,
    endTimeMs,
    limit,
    ascending: query.ascending ?? true,
  }

  if (query.origins !== undefined) {
    if (query.origins === 'own-app') {
      nativeQuery.ownAppOnly = true
    } else if (Array.isArray(query.origins)) {
      nativeQuery.originIdentifiers = canonicalizeOriginIdentifiers(query.origins)
    } else {
      throw new Error("origins must be 'own-app' or an array of origin identifiers")
    }
  }

  if (query.cursor !== undefined) nativeQuery.cursor = query.cursor

  return nativeQuery
}

export function makeNativeTimeRangeQuery(query: HealthTimeRangeQuery): NativeHealthTimeRangeQuery {
  const { startTimeMs, endTimeMs } = makeTimeRange(query)

  return {
    startTimeMs,
    endTimeMs,
  }
}

const STATISTICS_BUCKETS: readonly StatisticsBucket[] = ['hour', 'day', 'week', 'month']

const STATISTICS_METRICS_BY_DATA_TYPE = {
  steps: ['sum'],
  distance: ['sum'],
  activeEnergyBurned: ['sum'],
  basalEnergyBurned: ['sum'],
  totalEnergyBurned: ['sum'],
  hydration: ['sum'],
  floorsClimbed: ['sum'],
  heartRate: ['avg', 'min', 'max'],
  bloodPressure: [],
  bloodGlucose: [],
  bodyTemperature: [],
  respiratoryRate: [],
  bodyFat: [],
  leanBodyMass: [],
  basalBodyTemperature: [],
  restingHeartRate: ['avg', 'min', 'max'],
  heartRateVariability: [],
  oxygenSaturation: [],
  height: ['avg', 'min', 'max'],
  vo2Max: [],
  bodyMass: ['avg', 'min', 'max'],
  sleep: ['duration'],
  workout: ['duration'],
  nutrition: [],
  nutritionEnergyConsumed: ['sum'],
  nutritionProtein: ['sum'],
  nutritionTotalCarbohydrate: ['sum'],
  nutritionTotalFat: ['sum'],
  nutritionDietaryFiber: ['sum'],
  nutritionSugar: ['sum'],
  nutritionSodium: ['sum'],
} satisfies Record<HealthStatisticsDataType, readonly StatisticsMetric[]>

const STATISTICS_METRICS: readonly StatisticsMetric[] = Array.from(
  new Set(Object.values(STATISTICS_METRICS_BY_DATA_TYPE).flat())
)

export function makeNativeStatisticsQuery(
  dataType: HealthStatisticsDataType,
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

  const supportedMetrics = [...STATISTICS_METRICS_BY_DATA_TYPE[dataType]]

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

  const nativeQuery: NativeHealthStatisticsQuery = {
    startTimeMs,
    endTimeMs,
    bucket: query.bucket,
    metrics,
  }

  if (query.timeZone !== undefined) {
    if (typeof query.timeZone !== 'string' || query.timeZone.trim() === '') {
      throw new Error('timeZone must be a non-empty IANA time-zone identifier')
    }
    nativeQuery.timeZone = query.timeZone
  }

  return nativeQuery
}
