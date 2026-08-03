import type { HealthSampleIdentity } from './HealthSampleIdentity'

/** Body mass sample returned by {@linkcode NitroHealth.readBodyMass}. */
export interface BodyMassSample extends HealthSampleIdentity {
  /** Start of the body mass sample interval. */
  startDate: Date
  /** End of the body mass sample interval. */
  endDate: Date
  /** Body mass in kilograms. */
  kilograms: number
  /** Originating app or device, when available. */
  source?: string
}
