/** Heart rate statistics returned by {@linkcode NitroHealth.readHeartRateStatistics}. */
export interface HeartRateStatistics {
  /** Average heart rate in beats per minute, or undefined when no data matches the query. */
  average?: number
  /** Minimum heart rate in beats per minute, or undefined when no data matches the query. */
  min?: number
  /** Maximum heart rate in beats per minute, or undefined when no data matches the query. */
  max?: number
}
