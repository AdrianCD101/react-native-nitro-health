import type { NativeHealthSampleMetadata } from './NativeHealthSampleMetadata'

/** Native oxygen saturation sample shape returned through the Nitro spec. */
export interface NativeOxygenSaturationSample {
  sampleMetadata: NativeHealthSampleMetadata
  timeMs: number
  percentage: number
}
