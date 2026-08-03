import type { HealthSampleIdentity } from './HealthSampleIdentity'

/** Distance interval returned by {@linkcode NitroHealth.readDistance}. */
export interface DistanceSample extends HealthSampleIdentity {
  /** Inclusive start of the sample interval. */
  startDate: Date
  /** Exclusive end of the sample interval. */
  endDate: Date
  /** Distance traveled in meters. */
  distanceMeters: number
}
