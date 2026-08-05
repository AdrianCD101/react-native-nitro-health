/** Semantic coverage of a distance sample or aggregate. */
export type DistanceScope = 'walking-running' | 'activity-unspecified'

/** Result returned after writing walking/running distance. */
export interface DistanceWriteResult {
  /** The distance values were stored. */
  status: 'completed'
  /** Scope retained by the native health service. */
  storedScope: DistanceScope
}
