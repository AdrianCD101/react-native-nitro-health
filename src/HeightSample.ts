import type { HealthSample } from './HealthSample'

/** Height sample returned by {@linkcode NitroHealth.readHeight}. */
export interface HeightSample extends HealthSample {
  /** Instant the measurement was taken. */
  date: Date
  /** Height in meters. */
  meters: number
}
