import type { NativeHealthWriteMetadata } from './NativeHealthWriteMetadata'

/** Native oxygen saturation sample input shape passed through the Nitro spec. */
export interface NativeOxygenSaturationSampleInput {
  timeMs: number
  percentage: number
  writeMetadata: NativeHealthWriteMetadata
}
