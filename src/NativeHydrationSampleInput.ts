import type { NativeHealthWriteMetadata } from './NativeHealthWriteMetadata'

/** Native hydration sample input shape passed through the Nitro spec. */
export interface NativeHydrationSampleInput {
  startTimeMs: number
  endTimeMs: number
  milliliters: number
  writeMetadata: NativeHealthWriteMetadata
}
