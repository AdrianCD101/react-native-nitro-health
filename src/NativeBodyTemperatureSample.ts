import type { NativeHealthDataOrigin } from './NativeHealthDataOrigin'
import type { NativeHealthSampleIdentity } from './NativeHealthSampleIdentity'

/** Native body temperature sample shape returned through the Nitro spec. */
export interface NativeBodyTemperatureSample {
  identity: NativeHealthSampleIdentity
  origin: NativeHealthDataOrigin
  timeMs: number
  celsius: number
}
