import type { HealthDeviceInfo } from './HealthDeviceInfo'
import type { HealthRecordSync } from './HealthRecordSync'
import type { HealthRecordingMethod } from './HealthRecordingMethod'

/** Respiratory rate sample accepted by {@linkcode NitroHealth.saveRespiratoryRate}. */
export interface RespiratoryRateSampleInput {
  /** Instant the reading was taken. */
  date: Date
  /** Respiratory rate in breaths per minute. Must be between 0 and 120 inclusive. */
  breathsPerMinute: number
  /** Physical device asserted as having generated this sample. */
  device?: HealthDeviceInfo
  /**
   * Requested recording method. On iOS, active and automatic recording degrade to `unknown`.
   * @default 'unknown'
   */
  recordingMethod?: HealthRecordingMethod
  /** Optional logical identity that makes retries idempotent and higher versions replace. */
  sync?: HealthRecordSync
}
