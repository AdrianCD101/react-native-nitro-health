import type { HealthRecordSync } from './HealthRecordSync'
import type { HealthRecordingMethod } from './HealthRecordingMethod'

/** Step count sample accepted by {@linkcode NitroHealth.saveSteps}. */
export interface StepSampleInput {
  /** Sample start time. */
  startDate: Date
  /** Sample end time. */
  endDate: Date
  /** Number of steps recorded during the sample range (1 to 1,000,000). */
  count: number
  /**
   * Requested recording method. On iOS, active and automatic recording degrade to `unknown`.
   * @default 'unknown'
   */
  recordingMethod?: HealthRecordingMethod
  /** Optional logical identity that makes retries idempotent and higher versions replace. */
  sync?: HealthRecordSync
}
