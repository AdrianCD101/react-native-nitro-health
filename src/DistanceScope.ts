import type { HealthWriteResult } from './HealthWriteResult'

/** Semantic coverage of a distance sample or aggregate. */
export type DistanceScope = 'walking-running' | 'activity-unspecified'

/** Result returned after writing walking/running distance. */
export interface DistanceWriteResult extends HealthWriteResult {
  /** Scope retained by the native health service. */
  storedScope: DistanceScope
}
