import type { NativeHealthSampleMetadata } from './NativeHealthSampleMetadata'

/** Native active-energy interval with epoch millisecond timestamps. */
export interface NativeActiveEnergyBurnedSample {
  sampleMetadata: NativeHealthSampleMetadata
  /** Inclusive start of the sample interval as Unix epoch milliseconds. */
  startTimeMs: number
  /** Exclusive end of the sample interval as Unix epoch milliseconds. */
  endTimeMs: number
  /** Active energy burned in kilocalories. */
  kilocalories: number
}
