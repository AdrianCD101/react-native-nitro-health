import type { NativeHealthSampleMetadata } from './NativeHealthSampleMetadata'

/** Native hydration interval with epoch millisecond timestamps. */
export interface NativeHydrationSample {
  sampleMetadata: NativeHealthSampleMetadata
  /** Inclusive start of the sample interval as Unix epoch milliseconds. */
  startTimeMs: number
  /** Exclusive end of the sample interval as Unix epoch milliseconds. */
  endTimeMs: number
  /** Water consumed in milliliters. */
  milliliters: number
}
