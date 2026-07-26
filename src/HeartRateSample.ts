/** Heart rate sample returned by {@linkcode NitroHealth.readHeartRate}. */
export interface HeartRateSample {
  /**
   * Stable sample identifier. The HealthKit sample UUID on iOS. On Android,
   * Health Connect stores several readings per record, so each sample gets the
   * record id plus a `#index` suffix (e.g. `"a1b2…#3"`).
   */
  uuid: string
  /** Instant the reading was taken. */
  date: Date
  /** Heart rate in beats per minute. */
  bpm: number
  /** Originating app or device, when available. */
  source?: string
}
