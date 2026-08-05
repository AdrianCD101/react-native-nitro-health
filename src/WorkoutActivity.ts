import type { WorkoutActivityType } from './WorkoutActivityType'

/** Semantic activity information returned with a workout. */
export type WorkoutActivity =
  | {
      /** The native activity was recognized. */
      status: 'known'
      /** Normalized activity type. */
      type: WorkoutActivityType
      /** Whether the activity can also be written portably. */
      portability: 'portable' | 'read-only'
      /** Whether normalization preserved or broadened the native activity. */
      mapping: 'exact' | 'broadened'
    }
  | {
      /** The native activity is unknown to this version of Nitro Health. */
      status: 'unknown'
    }
