import type { NativeHealthDataOrigin } from './NativeHealthDataOrigin'
import type { NativeHealthSampleIdentity } from './NativeHealthSampleIdentity'

/** Native heart rate variability sample shape returned through the Nitro spec. */
export interface NativeHeartRateVariabilitySample {
  identity: NativeHealthSampleIdentity
  origin: NativeHealthDataOrigin
  timeMs: number
  milliseconds: number
  method: string
}
