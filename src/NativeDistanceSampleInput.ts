import type { NativeDistanceScope } from './NativeDistanceWriteResult'
import type { NativeHealthWriteMetadata } from './NativeHealthWriteMetadata'

/** Native distance sample input shape passed through the Nitro spec. */
export interface NativeDistanceSampleInput {
  startTimeMs: number
  endTimeMs: number
  distanceMeters: number
  scope: NativeDistanceScope
  writeMetadata: NativeHealthWriteMetadata
}
