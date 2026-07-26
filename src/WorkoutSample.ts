import type { WorkoutActivityType } from './WorkoutActivityType'

/** Workout session returned by {@linkcode NitroHealth.readWorkouts}. */
export interface WorkoutSample {
  /** Stable sample identifier: the HealthKit sample UUID on iOS, the Health Connect record id on Android. */
  uuid: string
  /** Start of the workout session. */
  startDate: Date
  /** End of the workout session. */
  endDate: Date
  /**
   * Active duration in seconds. Pause-aware on iOS (`HKWorkout.duration`);
   * wall-clock `endDate - startDate` on Android.
   */
  durationSeconds: number
  /** Normalized cross-platform activity type. */
  activityType: WorkoutActivityType
  /**
   * Session title on Android; workout brand name metadata on iOS
   * (best-effort, rarely set).
   */
  title?: string
  /** Originating app or device, when available. */
  source?: string
  /** Total distance in meters. iOS only; `undefined` on Android. */
  totalDistanceMeters?: number
  /** Total active energy burned in kilocalories. iOS only; `undefined` on Android. */
  totalEnergyBurnedKcal?: number
}
