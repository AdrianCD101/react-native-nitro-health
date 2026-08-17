import type { NativeHealthWriteMetadata } from './NativeHealthWriteMetadata'

/** Native resting heart rate sample input shape passed through the Nitro spec. */
export interface NativeRestingHeartRateSampleInput {
  timeMs: number
  bpm: number
  writeMetadata: NativeHealthWriteMetadata
}
