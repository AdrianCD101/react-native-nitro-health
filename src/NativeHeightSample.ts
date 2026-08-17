import type { NativeHealthSampleMetadata } from './NativeHealthSampleMetadata'

/** Native height sample shape returned through the Nitro spec. */
export interface NativeHeightSample {
  sampleMetadata: NativeHealthSampleMetadata
  timeMs: number
  meters: number
}
