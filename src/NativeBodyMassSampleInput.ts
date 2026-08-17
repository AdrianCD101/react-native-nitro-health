import type { NativeHealthWriteMetadata } from './NativeHealthWriteMetadata'

/** Native body mass sample input shape passed through the Nitro spec. */
export interface NativeBodyMassSampleInput {
  timeMs: number
  kilograms: number
  writeMetadata: NativeHealthWriteMetadata
}
