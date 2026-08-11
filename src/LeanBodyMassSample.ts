import type { HealthSample } from './HealthSample'

/** Lean body mass sample returned by {@linkcode NitroHealth.readLeanBodyMass}. */
export interface LeanBodyMassSample extends HealthSample {
  /** Instant the reading was taken. */
  date: Date
  /** Lean body mass in kilograms. */
  kilograms: number
}
