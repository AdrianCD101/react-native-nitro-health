import type { HealthRecordSync } from './HealthRecordSync'

/** Respiratory rate sample accepted by {@linkcode NitroHealth.saveRespiratoryRate}. */
export interface RespiratoryRateSampleInput {
  /** Instant the reading was taken. */
  date: Date
  /** Respiratory rate in breaths per minute. Must be between 0 and 120 inclusive. */
  breathsPerMinute: number
  /** Optional logical identity that makes retries idempotent and higher versions replace. */
  sync?: HealthRecordSync
}
