import type { HealthSampleIdentity } from './HealthSampleIdentity'

/** Resting heart rate sample returned by {@linkcode NitroHealth.readRestingHeartRate}. */
export interface RestingHeartRateSample extends HealthSampleIdentity {
  /** Instant the reading was taken. */
  date: Date
  /** Resting heart rate in beats per minute. */
  bpm: number
  /** Originating app or device, when available. */
  source?: string
}
