import type { NativeHealthDataOrigin } from './NativeHealthDataOrigin'
import type { NativeHealthDeviceInfo } from './NativeHealthDeviceInfo'
import type { NativeHealthRecordingMethod } from './NativeHealthRecordingMethod'
import type { NativeHealthSampleIdentity } from './NativeHealthSampleIdentity'

/** Native heart rate sample shape returned through the Nitro spec. */
export interface NativeHeartRateSample {
  identity: NativeHealthSampleIdentity
  origin: NativeHealthDataOrigin
  device?: NativeHealthDeviceInfo
  recordingMethod: NativeHealthRecordingMethod
  timeMs: number
  bpm: number
}
