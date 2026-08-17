import type { NativeHealthSampleMetadata } from './NativeHealthSampleMetadata'

/** Native step sample shape returned through the Nitro spec. */
export interface NativeStepSample {
  sampleMetadata: NativeHealthSampleMetadata
  startTimeMs: number
  endTimeMs: number
  count: number
}
