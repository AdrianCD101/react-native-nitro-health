import type { BloodPressureMetadata } from './BloodPressureMetadata'
import type { HealthDeviceInfo } from './HealthDeviceInfo'
import type { HealthRecordSync } from './HealthRecordSync'
import type { HealthRecordingMethod } from './HealthRecordingMethod'

/** Blood pressure reading accepted by {@linkcode NitroHealth.saveBloodPressure}. */
export interface BloodPressureSampleInput {
  /** Instant the reading was taken. */
  date: Date
  /** Systolic pressure in millimeters of mercury. Must be between 20 and 200 inclusive. */
  systolicMmHg: number
  /** Diastolic pressure in millimeters of mercury. Must be between 10 and 180 inclusive. */
  diastolicMmHg: number
  /** Physical device asserted as having generated this sample. */
  device?: HealthDeviceInfo
  /** Platform-scoped fields retained by the native health store. */
  metadata?: BloodPressureMetadata
  /**
   * Requested recording method. On iOS, active and automatic recording degrade to `unknown`.
   * @default 'unknown'
   */
  recordingMethod?: HealthRecordingMethod
  /** Optional logical identity that makes retries idempotent and higher versions replace. */
  sync?: HealthRecordSync
}
