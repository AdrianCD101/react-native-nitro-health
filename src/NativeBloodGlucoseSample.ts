import type { NativeHealthDataOrigin } from './NativeHealthDataOrigin'
import type { NativeHealthSampleIdentity } from './NativeHealthSampleIdentity'

/** Native blood glucose sample shape returned through the Nitro spec. */
export interface NativeBloodGlucoseSample {
  identity: NativeHealthSampleIdentity
  origin: NativeHealthDataOrigin
  timeMs: number
  millimolesPerLiter: number
}
