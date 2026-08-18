import type { HealthWriteMetadataInput } from './HealthWriteMetadataInput'

/** Distance sample accepted by {@linkcode NitroHealth.saveDistance}. */
export interface DistanceSampleInput extends HealthWriteMetadataInput {
  /** Declares that the supplied distance was measured while walking or running. */
  scope: 'walking-running'
  /** Sample start time. */
  startDate: Date
  /** Sample end time. */
  endDate: Date
  /** Distance covered during the sample range, in meters (0 to 1,000,000). */
  distanceMeters: number
}
