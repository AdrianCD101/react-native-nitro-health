import type { NativeHealthWriteMetadata } from './NativeHealthWriteMetadata'

/** Native active energy sample input shape passed through the Nitro spec. */
export interface NativeActiveEnergyBurnedSampleInput {
  startTimeMs: number
  endTimeMs: number
  kilocalories: number
  writeMetadata: NativeHealthWriteMetadata
}
