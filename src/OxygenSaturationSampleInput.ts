import type { HealthDeviceInfo } from './HealthDeviceInfo'
import type { HealthRecordSync } from './HealthRecordSync'
import type { HealthRecordingMethod } from './HealthRecordingMethod'

/** Oxygen saturation sample accepted by {@linkcode NitroHealth.saveOxygenSaturation}. */
export interface OxygenSaturationSampleInput {
  /** Instant the reading was taken. */
  date: Date
  /**
   * Oxygen saturation as a percentage. Must be between 0 and 100 inclusive. iOS stores this
   * as HealthKit's 0-1 fraction (divided by 100 before saving); Android stores it directly.
   */
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
