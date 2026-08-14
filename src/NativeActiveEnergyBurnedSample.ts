import type { NativeHealthDataOrigin } from './NativeHealthDataOrigin'
import type { NativeHealthRecordingMethod } from './NativeHealthRecordingMethod'
import type { NativeHealthSampleIdentity } from './NativeHealthSampleIdentity'

/** Native active-energy interval with epoch millisecond timestamps. */
export interface NativeActiveEnergyBurnedSample {
  identity: NativeHealthSampleIdentity
  origin: NativeHealthDataOrigin
  recordingMethod: NativeHealthRecordingMethod
  /** Inclusive start of the sample interval as Unix epoch milliseconds. */
  startTimeMs: number
  /** Exclusive end of the sample interval as Unix epoch milliseconds. */
  endTimeMs: number
  /** Active energy burned in kilocalories. */
  kilocalories: number
}
