/** Aggregated statistics bucket returned by {@linkcode NitroHealth.readStatistics}. */
export interface HealthStatistics {
  /** Inclusive start of this bucket. */
  startDate: Date
  /** Exclusive end of this bucket. */
  endDate: Date
  /** Sum of matching values, present only when 'sum' was requested and supported. */
  sum?: number
  /** Average of matching values, present only when 'avg' was requested and supported. */
  avg?: number
  /** Minimum of matching values, present only when 'min' was requested and supported. */
  min?: number
  /** Maximum of matching values, present only when 'max' was requested and supported. */
  max?: number
  /**
   * Resolved IANA time zone the buckets were computed in — the query's
   * {@linkcode HealthStatisticsQuery.timeZone} when provided, otherwise the
   * device's time zone at query time.
   */
  timeZone: string
}

/** Distance statistics with explicit native activity coverage. */
export interface DistanceStatistics extends HealthStatistics {
  /** Activity coverage represented by the aggregate. */
  scope: 'walking-running' | 'activity-unspecified'
}
