/** Heart rate sample returned by {@linkcode NitroHealth.readHeartRate}. */
export interface HeartRateSample {
  /** Instant the reading was taken. */
  date: Date
  /** Heart rate in beats per minute. */
  bpm: number
  /** Originating app or device, when available. */
  source?: string
}
