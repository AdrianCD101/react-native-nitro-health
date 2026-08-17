import type { NativeHealthDataOrigin } from './NativeHealthDataOrigin'
import type { NativeHealthDeviceInfo } from './NativeHealthDeviceInfo'
import type { NativeHealthRecordingMethod } from './NativeHealthRecordingMethod'
import type { NativeHealthMetricValue } from './NativeHealthMetricValue'
import type { NativeHealthSampleIdentity } from './NativeHealthSampleIdentity'
import type { NativeWorkoutActivity } from './NativeWorkoutActivity'

/** Native workout session shape returned through the Nitro spec. */
export interface NativeWorkoutSample {
  identity: NativeHealthSampleIdentity
  origin: NativeHealthDataOrigin
  device?: NativeHealthDeviceInfo
  recordingMethod: NativeHealthRecordingMethod
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
