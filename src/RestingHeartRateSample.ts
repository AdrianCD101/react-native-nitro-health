import type { HealthSample } from './HealthSample'

/** Resting heart rate sample returned by {@linkcode NitroHealth.readRestingHeartRate}. */
export interface RestingHeartRateSample extends HealthSample {
  /** Instant the reading was taken. */
  date: Date
  /** Resting heart rate in beats per minute. */
  bpm: number
}
