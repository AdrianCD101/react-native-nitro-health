import type { HealthSample } from './HealthSample'

/** Floors climbed interval returned by {@linkcode NitroHealth.readFloorsClimbed}. */
export interface FloorsClimbedSample extends HealthSample {
  /** Inclusive start of the sample interval. */
  startDate: Date
  /** Exclusive end of the sample interval. */
  endDate: Date
  /** Floors climbed during the sample interval. On iOS, this is HealthKit's flights-climbed count. */
  floors: number
}
