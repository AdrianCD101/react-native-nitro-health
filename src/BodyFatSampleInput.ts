import type { HealthRecordSync } from './HealthRecordSync'

/** Body fat sample accepted by {@linkcode NitroHealth.saveBodyFat}. */
export interface BodyFatSampleInput {
  /** Instant the reading was taken. */
  date: Date
  /** Body fat in percent of total body mass. Must be between 0 and 100 inclusive. */
  percentage: number
  /** Optional logical identity that makes retries idempotent and higher versions replace. */
  sync?: HealthRecordSync
}
