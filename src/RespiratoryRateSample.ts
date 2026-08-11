import type { HealthSample } from './HealthSample'

/** Respiratory rate sample returned by {@linkcode NitroHealth.readRespiratoryRate}. */
export interface RespiratoryRateSample extends HealthSample {
  /** Instant the reading was taken. */
  date: Date
  /** Respiratory rate in breaths per minute. */
  breathsPerMinute: number
}
