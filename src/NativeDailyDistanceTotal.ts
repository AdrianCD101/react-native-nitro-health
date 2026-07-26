/** Native daily distance total bucket returned through the Nitro spec. Aggregated buckets carry no identity. */
export interface NativeDailyDistanceTotal {
  /** Inclusive start of the day bucket as Unix epoch milliseconds. */
  startTimeMs: number
  /** Exclusive end of the day bucket as Unix epoch milliseconds. */
  endTimeMs: number
  /** Distance traveled in meters. */
  distanceMeters: number
}
