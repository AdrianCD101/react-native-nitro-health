import type { NativeHealthDataOrigin } from './NativeHealthDataOrigin'
import type { NativeHealthSampleIdentity } from './NativeHealthSampleIdentity'

/** Native VO2 max sample shape returned through the Nitro spec. */
export interface NativeVo2MaxSample {
  identity: NativeHealthSampleIdentity
  origin: NativeHealthDataOrigin
  timeMs: number
  millilitersPerKilogramPerMinute: number
}
