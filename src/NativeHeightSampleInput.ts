import type { NativeHealthWriteMetadata } from './NativeHealthWriteMetadata'

/** Native height sample input shape passed through the Nitro spec. */
export interface NativeHeightSampleInput {
  timeMs: number
  meters: number
  writeMetadata: NativeHealthWriteMetadata
}
