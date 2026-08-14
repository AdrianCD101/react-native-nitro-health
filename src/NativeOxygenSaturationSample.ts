import type { NativeHealthDataOrigin } from './NativeHealthDataOrigin'
import type { NativeHealthRecordingMethod } from './NativeHealthRecordingMethod'
import type { NativeHealthSampleIdentity } from './NativeHealthSampleIdentity'

/** Native oxygen saturation sample shape returned through the Nitro spec. */
export interface NativeOxygenSaturationSample {
  identity: NativeHealthSampleIdentity
  origin: NativeHealthDataOrigin
  recordingMethod: NativeHealthRecordingMethod
  timeMs: number
  percentage: number
}
