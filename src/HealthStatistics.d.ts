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
}
