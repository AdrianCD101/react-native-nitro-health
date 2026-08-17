import type { NativeHealthWriteMetadata } from './NativeHealthWriteMetadata'

/** Native heart rate sample input shape passed through the Nitro spec. */
export interface NativeHeartRateSampleInput {
  timeMs: number
  bpm: number
  writeMetadata: NativeHealthWriteMetadata
}
