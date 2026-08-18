import type { HealthWriteMetadataInput } from './HealthWriteMetadataInput'

/** Respiratory rate sample accepted by {@linkcode NitroHealth.saveRespiratoryRate}. */
export interface RespiratoryRateSampleInput extends HealthWriteMetadataInput {
  /** Instant the reading was taken. */
  date: Date
  /** Respiratory rate in breaths per minute. Must be between 0 and 120 inclusive. */
  breathsPerMinute: number
}
