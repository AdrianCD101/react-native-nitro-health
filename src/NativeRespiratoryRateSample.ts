import type { NativeHealthSampleMetadata } from './NativeHealthSampleMetadata'

/** Native respiratory rate sample shape returned through the Nitro spec. */
export interface NativeRespiratoryRateSample {
  sampleMetadata: NativeHealthSampleMetadata
  timeMs: number
  breathsPerMinute: number
}
