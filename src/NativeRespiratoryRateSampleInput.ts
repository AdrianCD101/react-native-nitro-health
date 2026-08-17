import type { NativeHealthWriteMetadata } from './NativeHealthWriteMetadata'

/** Native respiratory rate sample input shape passed through the Nitro spec. */
export interface NativeRespiratoryRateSampleInput {
  timeMs: number
  breathsPerMinute: number
  writeMetadata: NativeHealthWriteMetadata
}
