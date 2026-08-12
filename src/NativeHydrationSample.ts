import type { NativeHealthDataOrigin } from './NativeHealthDataOrigin'
import type { NativeHealthSampleIdentity } from './NativeHealthSampleIdentity'

/** Native hydration interval with epoch millisecond timestamps. */
export interface NativeHydrationSample {
  identity: NativeHealthSampleIdentity
  origin: NativeHealthDataOrigin
  /** Inclusive start of the sample interval as Unix epoch milliseconds. */
  startTimeMs: number
  /** Exclusive end of the sample interval as Unix epoch milliseconds. */
  endTimeMs: number
  /** Water consumed in milliliters. */
  milliliters: number
}
