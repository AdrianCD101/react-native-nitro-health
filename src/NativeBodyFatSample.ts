import type { NativeHealthSampleMetadata } from './NativeHealthSampleMetadata'

/** Native body fat sample shape returned through the Nitro spec. */
export interface NativeBodyFatSample {
  sampleMetadata: NativeHealthSampleMetadata
  timeMs: number
  percentage: number
}
