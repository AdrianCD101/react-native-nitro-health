import type { HealthMetricValue } from './HealthMetricValue'
import type { HealthSample } from './HealthSample'
import type { WorkoutActivity } from './WorkoutActivity'

/** Workout session returned by {@linkcode NitroHealth.readWorkouts}. */
export interface WorkoutSample extends HealthSample {
  /** Start of the workout session. */
  startDate: Date
  /** End of the workout session. */
  endDate: Date
  /** Wall-clock duration between `startDate` and `endDate`, in seconds. */
  elapsedDurationSeconds: number
  /** Pause-aware active duration in seconds when the health service reports it. */
  activeDuration: HealthMetricValue
  /** Normalized activity plus portability and mapping fidelity. */
  activity: WorkoutActivity
  /** Native workout session title when available. */
  title?: string
  /** Native workout brand metadata when available. */
  brandName?: string
  /** Session-associated total distance in meters. */
  totalDistance: HealthMetricValue
  /** Session-associated active energy in kilocalories. */
  totalActiveEnergyBurned: HealthMetricValue
}
