import type { HealthRecordSync } from './HealthRecordSync'
import type { HealthRecordingMethod } from './HealthRecordingMethod'

/** Lean body mass sample accepted by {@linkcode NitroHealth.saveLeanBodyMass}. */
export interface LeanBodyMassSampleInput {
  /** Instant the reading was taken. */
  date: Date
  /** Lean body mass in kilograms. Must be greater than 0 and at most 1,000. */
  kilograms: number
  /**
   * Requested recording method. On iOS, active and automatic recording degrade to `unknown`.
   * @default 'unknown'
   */
  recordingMethod?: HealthRecordingMethod
  /** Optional logical identity that makes retries idempotent and higher versions replace. */
  sync?: HealthRecordSync
}
