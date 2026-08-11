import type { NativeHealthDataOrigin } from './NativeHealthDataOrigin'
import type { NativeHealthSampleIdentity } from './NativeHealthSampleIdentity'

/** Native blood pressure sample shape returned through the Nitro spec. */
export interface NativeBloodPressureSample {
  identity: NativeHealthSampleIdentity
  origin: NativeHealthDataOrigin
  timeMs: number
  systolicMmHg: number
  diastolicMmHg: number
}
