import type { NativeHealthWriteMetadata } from './NativeHealthWriteMetadata'

/** Native lean body mass sample input shape passed through the Nitro spec. */
export interface NativeLeanBodyMassSampleInput {
  timeMs: number
  kilograms: number
  writeMetadata: NativeHealthWriteMetadata
}
