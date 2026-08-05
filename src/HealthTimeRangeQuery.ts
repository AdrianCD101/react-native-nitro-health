/**
 * Time range query used by aggregate health APIs such as
 * {@linkcode NitroHealth.readHeartRateStatistics} and by
 * {@linkcode NitroHealth.deleteRecordsByTimeRange}.
 */
export interface HealthTimeRangeQuery {
  /** Inclusive start of the query range. Must be before {@linkcode endDate}. */
  startDate: Date
  /** Exclusive end of the query range. Must be after {@linkcode startDate}. */
  endDate: Date
}
