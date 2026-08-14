import type { NativeHealthDataOrigin } from './NativeHealthDataOrigin'
import type { NativeHealthRecordingMethod } from './NativeHealthRecordingMethod'
import type { NativeHealthSampleIdentity } from './NativeHealthSampleIdentity'

/** Native heart rate sample shape returned through the Nitro spec. */
export interface NativeHeartRateSample {
  identity: NativeHealthSampleIdentity
  origin: NativeHealthDataOrigin
  recordingMethod: NativeHealthRecordingMethod
  timeMs: number
  bpm: number
}
