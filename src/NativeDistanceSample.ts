import type { NativeHealthSampleMetadata } from './NativeHealthSampleMetadata'
import type { NativeDistanceScope } from './NativeDistanceWriteResult'

/** Native distance interval with epoch millisecond timestamps. */
export interface NativeDistanceSample {
  sampleMetadata: NativeHealthSampleMetadata
  /** Inclusive start of the sample interval as Unix epoch milliseconds. */
  startTimeMs: number
  /** Exclusive end of the sample interval as Unix epoch milliseconds. */
  endTimeMs: number
  /** Distance traveled in meters. */
  distanceMeters: number
  scope: NativeDistanceScope
}
