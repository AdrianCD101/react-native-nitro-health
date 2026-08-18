import type { StatisticsBucket } from './StatisticsBucket'
import type { StatisticsMetric } from './StatisticsMetric'

/** Bucketed aggregate query used by {@linkcode NitroHealth.readStatistics}. */
export interface HealthStatisticsQuery {
  /** Inclusive start of the query range. Also anchors the first bucket boundary. */
  startDate: Date
  /** Exclusive end of the query range. Must be after {@linkcode startDate}. */
  endDate: Date
  /** Size of each result bucket. */
  bucket: StatisticsBucket
  /** Aggregate metrics to compute per bucket. Must be compatible with the queried data type. */
  metrics: StatisticsMetric[]
  /**
   * IANA time-zone identifier that day, week, and month buckets are computed in.
   * Defaults to the device's current time zone at query time. The resolved zone is
   * echoed on every returned bucket as {@linkcode HealthStatistics.timeZone}.
   */
  timeZone?: string
}
