import type { NativeHealthDataOrigin } from './NativeHealthDataOrigin'
import type { NativeHealthDeviceInfo } from './NativeHealthDeviceInfo'
import type { NativeHealthRecordingMethod } from './NativeHealthRecordingMethod'
import type { NativeHealthSampleIdentity } from './NativeHealthSampleIdentity'

/** Native height sample shape returned through the Nitro spec. */
export interface NativeHeightSample {
  identity: NativeHealthSampleIdentity
  origin: NativeHealthDataOrigin
  device?: NativeHealthDeviceInfo
  recordingMethod: NativeHealthRecordingMethod
  timeMs: number
  meters: number
}
