import type { NativeHealthSampleMetadata } from './NativeHealthSampleMetadata'

/** Native body mass sample shape returned through the Nitro spec. */
export interface NativeBodyMassSample {
  sampleMetadata: NativeHealthSampleMetadata
  startTimeMs: number
  endTimeMs: number
  kilograms: number
}
