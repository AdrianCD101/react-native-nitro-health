import type { HealthRecordSync } from './HealthRecordSync'
import type { HealthRecordingMethod } from './HealthRecordingMethod'
import type { WritableWorkoutActivityType } from './WritableWorkoutActivityType'

/** Completed workout accepted by {@linkcode NitroHealth.saveWorkout}. */
export interface WorkoutSampleInput {
  /** Start of the workout. */
  startDate: Date
  /** End of the workout. */
  endDate: Date
  /** Portable workout activity recorded during the interval. */
  activityType: WritableWorkoutActivityType
  /** Optional user-visible label, stored using the closest native workout metadata. */
  displayName?: string
  /** IANA time-zone identifier. Defaults to the device's current time zone. */
  timeZone?: string
  /**
   * Requested recording method. On iOS, active and automatic recording degrade to `unknown`.
   * @default 'unknown'
   */
  recordingMethod?: HealthRecordingMethod
  /** Optional logical identity that makes retries idempotent and higher versions replace. */
  sync?: HealthRecordSync
}
