import type { NativeHealthDataOrigin } from './NativeHealthDataOrigin'
import type { NativeHealthDeviceInfo } from './NativeHealthDeviceInfo'
import type { NativeHealthRecordingMethod } from './NativeHealthRecordingMethod'
import type { NativeHealthSampleIdentity } from './NativeHealthSampleIdentity'

/** Native body mass sample shape returned through the Nitro spec. */
export interface NativeBodyMassSample {
  identity: NativeHealthSampleIdentity
  origin: NativeHealthDataOrigin
  device?: NativeHealthDeviceInfo
  recordingMethod: NativeHealthRecordingMethod
  startTimeMs: number
  endTimeMs: number
  kilograms: number
}
