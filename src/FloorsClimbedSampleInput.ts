import type { HealthWriteMetadataInput } from './HealthWriteMetadataInput'

/** Floors climbed sample accepted by {@linkcode NitroHealth.saveFloorsClimbed}. */
export interface FloorsClimbedSampleInput extends HealthWriteMetadataInput {
  /** Sample start time. */
  startDate: Date
  /** Sample end time. */
  endDate: Date
  /** Floors climbed during the sample range (0 to 1,000,000). Stored as flights climbed on iOS. */
  floors: number
}
