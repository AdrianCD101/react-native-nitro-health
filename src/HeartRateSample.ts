import type { HealthSample } from './HealthSample'

/** Heart rate sample returned by {@linkcode NitroHealth.readHeartRate}. */
export interface HeartRateSample extends HealthSample {
  /** Instant the reading was taken. */
  date: Date
  /** Heart rate in beats per minute. */
  bpm: number
}
