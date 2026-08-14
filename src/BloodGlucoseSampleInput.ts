import type { BloodGlucoseMetadata } from './BloodGlucoseMetadata'
import type { HealthRecordSync } from './HealthRecordSync'
import type { HealthRecordingMethod } from './HealthRecordingMethod'

/** Blood glucose sample accepted by {@linkcode NitroHealth.saveBloodGlucose}. */
export interface BloodGlucoseSampleInput {
  /** Instant the reading was taken. */
  date: Date
  /** Blood glucose concentration in millimoles per liter. Must be between 0.5 and 50 inclusive. */
  millimolesPerLiter: number
  /** Platform-scoped fields retained by the native health store. */
  metadata?: BloodGlucoseMetadata
  /**
   * Requested recording method. On iOS, active and automatic recording degrade to `unknown`.
   * @default 'unknown'
   */
  recordingMethod?: HealthRecordingMethod
  /** Optional logical identity that makes retries idempotent and higher versions replace. */
  sync?: HealthRecordSync
}
