import type { NativeHealthDataOrigin } from './NativeHealthDataOrigin'
import type { NativeHealthSampleIdentity } from './NativeHealthSampleIdentity'

/** Native body mass sample shape returned through the Nitro spec. */
export interface NativeBodyMassSample {
  identity: NativeHealthSampleIdentity
  origin: NativeHealthDataOrigin
  startTimeMs: number
  endTimeMs: number
  kilograms: number
}
