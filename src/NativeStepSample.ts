import type { NativeHealthDataOrigin } from './NativeHealthDataOrigin'
import type { NativeHealthSampleIdentity } from './NativeHealthSampleIdentity'

/** Native step sample shape returned through the Nitro spec. */
export interface NativeStepSample {
  identity: NativeHealthSampleIdentity
  origin: NativeHealthDataOrigin
  startTimeMs: number
  endTimeMs: number
  count: number
}
