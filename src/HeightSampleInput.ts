import type { HealthRecordSync } from './HealthRecordSync'

/** Height sample accepted by {@linkcode NitroHealth.saveHeight}. */
export interface HeightSampleInput {
  /** Instant the measurement was taken. */
  date: Date
  /** Height in meters. Must be greater than 0 and no more than 3. */
  meters: number
  /** Optional logical identity that makes retries idempotent and higher versions replace. */
  sync?: HealthRecordSync
}
