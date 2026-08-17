import type { NativeHealthWriteMetadata } from './NativeHealthWriteMetadata'

/** Native floors climbed sample input shape passed through the Nitro spec. */
export interface NativeFloorsClimbedSampleInput {
  startTimeMs: number
  endTimeMs: number
  floors: number
  writeMetadata: NativeHealthWriteMetadata
}
