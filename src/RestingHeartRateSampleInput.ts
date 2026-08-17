import type { HealthDeviceInfo } from './HealthDeviceInfo'
import type { HealthRecordSync } from './HealthRecordSync'
import type { HealthRecordingMethod } from './HealthRecordingMethod'

/** Resting heart rate sample accepted by {@linkcode NitroHealth.saveRestingHeartRate}. */
export interface RestingHeartRateSampleInput {
  /** Instant the reading was taken. */
  date: Date
  /**
   * Resting heart rate in beats per minute. Must be between 1 and 300 (the range Health
   * Connect accepts). Android stores whole bpm, so fractional values are rounded to the
   * nearest integer there; iOS stores the exact value.
   */
  bpm: number
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
