import type { NativeHealthDataOrigin } from './NativeHealthDataOrigin'
import type { NativeHealthSampleIdentity } from './NativeHealthSampleIdentity'

/** Native lean body mass sample shape returned through the Nitro spec. */
export interface NativeLeanBodyMassSample {
  identity: NativeHealthSampleIdentity
  origin: NativeHealthDataOrigin
  timeMs: number
  kilograms: number
}
