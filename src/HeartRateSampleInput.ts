import type { HealthRecordSync } from './HealthRecordSync'
import type { HealthRecordingMethod } from './HealthRecordingMethod'

/** Heart rate sample accepted by {@linkcode NitroHealth.saveHeartRate}. */
export interface HeartRateSampleInput {
  /** Instant the reading was taken. */
  date: Date
  /**
   * Heart rate in beats per minute. Must be between 1 and 300 (the range Health Connect
   * accepts). Android stores whole bpm, so fractional values are rounded to the nearest
   * integer there; iOS stores the exact value.
   */
  bpm: number
  /**
   * Requested recording method. On iOS, active and automatic recording degrade to `unknown`.
   * @default 'unknown'
   */
  recordingMethod?: HealthRecordingMethod
  /** Optional logical identity that makes retries idempotent and higher versions replace. */
  sync?: HealthRecordSync
}
