import type { HealthSample } from './HealthSample'

/** Body mass sample returned by {@linkcode NitroHealth.readBodyMass}. */
export interface BodyMassSample extends HealthSample {
  /** Start of the body mass sample interval. */
  startDate: Date
  /** End of the body mass sample interval. */
  endDate: Date
  /** Body mass in kilograms. */
  kilograms: number
}
