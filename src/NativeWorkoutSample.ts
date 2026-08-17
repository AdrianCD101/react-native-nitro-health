import type { NativeHealthSampleMetadata } from './NativeHealthSampleMetadata'
import type { NativeHealthMetricValue } from './NativeHealthMetricValue'
import type { NativeWorkoutActivity } from './NativeWorkoutActivity'

/** Native workout session shape returned through the Nitro spec. */
export interface NativeWorkoutSample {
  sampleMetadata: NativeHealthSampleMetadata
  startTimeMs: number
  endTimeMs: number
  elapsedDurationSeconds: number
  activeDuration: NativeHealthMetricValue
  activity: NativeWorkoutActivity
  title?: string
  brandName?: string
  totalDistance: NativeHealthMetricValue
  totalActiveEnergyBurned: NativeHealthMetricValue
}
