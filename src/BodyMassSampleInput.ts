import type { HealthRecordSync } from './HealthRecordSync'
import type { HealthRecordingMethod } from './HealthRecordingMethod'

/** Body mass sample accepted by {@linkcode NitroHealth.saveBodyMass}. */
export interface BodyMassSampleInput {
  /** Instant the measurement was taken. */
  date: Date
  /** Body mass in kilograms (greater than 0, up to 1,000). */
  kilograms: number
  /**
   * Requested recording method. On iOS, active and automatic recording degrade to `unknown`.
   * @default 'unknown'
   */
  recordingMethod?: HealthRecordingMethod
  /** Optional logical identity that makes retries idempotent and higher versions replace. */
  sync?: HealthRecordSync
}
