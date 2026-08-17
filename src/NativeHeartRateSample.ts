import type { NativeHealthSampleMetadata } from './NativeHealthSampleMetadata'

/** Native heart rate sample shape returned through the Nitro spec. */
export interface NativeHeartRateSample {
  sampleMetadata: NativeHealthSampleMetadata
  timeMs: number
  bpm: number
}
