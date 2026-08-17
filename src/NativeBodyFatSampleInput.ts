import type { NativeHealthWriteMetadata } from './NativeHealthWriteMetadata'

/** Native body fat sample input shape passed through the Nitro spec. */
export interface NativeBodyFatSampleInput {
  timeMs: number
  percentage: number
  writeMetadata: NativeHealthWriteMetadata
}
