import type { NativeHealthDataOrigin } from './NativeHealthDataOrigin'
import type { NativeHealthRecordingMethod } from './NativeHealthRecordingMethod'
import type { NativeHealthSampleIdentity } from './NativeHealthSampleIdentity'

/** Native respiratory rate sample shape returned through the Nitro spec. */
export interface NativeRespiratoryRateSample {
  identity: NativeHealthSampleIdentity
  origin: NativeHealthDataOrigin
  recordingMethod: NativeHealthRecordingMethod
  timeMs: number
  breathsPerMinute: number
}
