import type { HealthSample } from './HealthSample'

/** Body fat sample returned by {@linkcode NitroHealth.readBodyFat}. */
export interface BodyFatSample extends HealthSample {
  /** Instant the reading was taken. */
  date: Date
  /** Body fat in percent of total body mass (0-100). */
  percentage: number
}
