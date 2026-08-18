import type { HealthWriteMetadataInput } from './HealthWriteMetadataInput'
import type { HealthDeviceInfo } from './HealthDeviceInfo'
import type { WritableWorkoutActivityType } from './WritableWorkoutActivityType'

/** Completed workout accepted by {@linkcode NitroHealth.saveWorkout}. */
export interface WorkoutSampleInput extends HealthWriteMetadataInput {
  /** Physical device asserted as having generated this workout. */
  device?: HealthDeviceInfo

  /** Start of the workout. */
  startDate: Date
  /** End of the workout. */
  endDate: Date
  /** Portable workout activity recorded during the interval. */
  activityType: WritableWorkoutActivityType
  /** Optional user-visible label, stored using the closest native workout metadata. */
  displayName?: string
}
