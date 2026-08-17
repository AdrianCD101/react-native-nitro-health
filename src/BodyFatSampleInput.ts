import type { HealthDeviceInfo } from './HealthDeviceInfo'
import type { HealthRecordSync } from './HealthRecordSync'
import type { HealthRecordingMethod } from './HealthRecordingMethod'

/** Body fat sample accepted by {@linkcode NitroHealth.saveBodyFat}. */
export interface BodyFatSampleInput {
  /** Instant the reading was taken. */
  date: Date
  /** Body fat in percent of total body mass. Must be between 0 and 100 inclusive. */
  percentage: number
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
