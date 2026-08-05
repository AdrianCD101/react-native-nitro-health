import type { DistanceScope } from './DistanceScope'
import type { HealthSample } from './HealthSample'

/** Distance interval returned by {@linkcode NitroHealth.readDistance}. */
export interface DistanceSample extends HealthSample {
  /** Inclusive start of the sample interval. */
  startDate: Date
  /** Exclusive end of the sample interval. */
  endDate: Date
  /** Distance traveled in meters. */
  distanceMeters: number
  /** Activity coverage represented by this native distance record. */
  scope: DistanceScope
}
