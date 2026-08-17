import type { NativeHealthSampleMetadata } from './NativeHealthSampleMetadata'

/** Native heart rate variability sample shape returned through the Nitro spec. */
export interface NativeHeartRateVariabilitySample {
  sampleMetadata: NativeHealthSampleMetadata
  timeMs: number
  milliseconds: number
  method: string
}
