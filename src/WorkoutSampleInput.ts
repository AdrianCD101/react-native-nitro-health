import type { HealthRecordSync } from './HealthRecordSync'
import type { WritableWorkoutActivityType } from './WritableWorkoutActivityType'

/** Completed workout accepted by {@linkcode NitroHealth.saveWorkout}. */
export interface WorkoutSampleInput {
  /** Start of the workout. */
  startDate: Date
  /** End of the workout. */
  endDate: Date
  /** Portable workout activity recorded during the interval. */
  activityType: WritableWorkoutActivityType
  /** Optional user-visible workout title. */
  title?: string
  /** IANA time-zone identifier. Defaults to the device's current time zone. */
  timeZone?: string
  /** Optional logical identity that makes retries idempotent and higher versions replace. */
  sync?: HealthRecordSync
}
