import type { NativeHealthSampleMetadata } from './NativeHealthSampleMetadata'

/** Native floors-climbed interval with epoch millisecond timestamps. */
export interface NativeFloorsClimbedSample {
  sampleMetadata: NativeHealthSampleMetadata
  /** Inclusive start of the sample interval as Unix epoch milliseconds. */
  startTimeMs: number
  /** Exclusive end of the sample interval as Unix epoch milliseconds. */
  endTimeMs: number
  /** Floors climbed during the sample interval. */
  floors: number
}
