import type { NativeHealthSampleMetadata } from './NativeHealthSampleMetadata'

/** Native resting heart rate sample shape returned through the Nitro spec. */
export interface NativeRestingHeartRateSample {
  sampleMetadata: NativeHealthSampleMetadata
  timeMs: number
  bpm: number
}
