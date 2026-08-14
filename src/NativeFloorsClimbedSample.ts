import type { NativeHealthDataOrigin } from './NativeHealthDataOrigin'
import type { NativeHealthRecordingMethod } from './NativeHealthRecordingMethod'
import type { NativeHealthSampleIdentity } from './NativeHealthSampleIdentity'

/** Native floors-climbed interval with epoch millisecond timestamps. */
export interface NativeFloorsClimbedSample {
  identity: NativeHealthSampleIdentity
  origin: NativeHealthDataOrigin
  recordingMethod: NativeHealthRecordingMethod
  /** Inclusive start of the sample interval as Unix epoch milliseconds. */
  startTimeMs: number
  /** Exclusive end of the sample interval as Unix epoch milliseconds. */
  endTimeMs: number
  /** Floors climbed during the sample interval. */
  floors: number
}
