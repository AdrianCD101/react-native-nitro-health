import type { HealthWriteMetadataInput } from './HealthWriteMetadataInput'

/** Body fat sample accepted by {@linkcode NitroHealth.saveBodyFat}. */
export interface BodyFatSampleInput extends HealthWriteMetadataInput {
  /** Instant the reading was taken. */
  date: Date
  /** Body fat in percent of total body mass. Must be between 0 and 100 inclusive. */
  percentage: number
}
