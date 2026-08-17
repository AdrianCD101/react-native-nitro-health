import type { NativeHealthSampleMetadata } from './NativeHealthSampleMetadata'

/** Native lean body mass sample shape returned through the Nitro spec. */
export interface NativeLeanBodyMassSample {
  sampleMetadata: NativeHealthSampleMetadata
  timeMs: number
  kilograms: number
}
