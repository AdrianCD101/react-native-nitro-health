/** Resting heart rate sample returned by {@linkcode NitroHealth.readRestingHeartRate}. */
export interface RestingHeartRateSample {
  /** Stable sample identifier: the HealthKit sample UUID on iOS, the Health Connect record id on Android. */
  uuid: string
  /** Instant the reading was taken. */
  date: Date
  /** Resting heart rate in beats per minute. */
  bpm: number
  /** Originating app or device, when available. */
  source?: string
}
