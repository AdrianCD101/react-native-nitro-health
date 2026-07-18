/** Distance sample accepted by {@linkcode NitroHealth.saveDistance}. */
export interface DistanceSampleInput {
  /** Sample start time. */
  startDate: Date
  /** Sample end time. */
  endDate: Date
  /** Distance covered during the sample range, in meters (0 to 1,000,000). */
  distanceMeters: number
}
