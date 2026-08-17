import type { NativeHealthWriteMetadata } from './NativeHealthWriteMetadata'

/** Native step sample input shape passed through the Nitro spec. */
export interface NativeStepSampleInput {
  startTimeMs: number
  endTimeMs: number
  count: number
  writeMetadata: NativeHealthWriteMetadata
}
