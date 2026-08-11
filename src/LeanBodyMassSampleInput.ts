import type { HealthRecordSync } from './HealthRecordSync'

/** Lean body mass sample accepted by {@linkcode NitroHealth.saveLeanBodyMass}. */
export interface LeanBodyMassSampleInput {
  /** Instant the reading was taken. */
  date: Date
  /** Lean body mass in kilograms. Must be greater than 0 and at most 1,000. */
  kilograms: number
  /** Optional logical identity that makes retries idempotent and higher versions replace. */
  sync?: HealthRecordSync
}
