import type { HealthSampleIdentity } from './HealthSampleIdentity'

/** Heart rate sample returned by {@linkcode NitroHealth.readHeartRate}. */
export interface HeartRateSample extends HealthSampleIdentity {
  /** Instant the reading was taken. */
  date: Date
  /** Heart rate in beats per minute. */
  bpm: number
  /** Originating app or device, when available. */
  source?: string
}
