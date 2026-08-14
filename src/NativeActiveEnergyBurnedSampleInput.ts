import type { NativeHealthRecordingMethod } from './NativeHealthRecordingMethod'

/** Native active energy sample input shape passed through the Nitro spec. */
export interface NativeActiveEnergyBurnedSampleInput {
  startTimeMs: number
  endTimeMs: number
  kilocalories: number
  recordingMethod?: NativeHealthRecordingMethod
  syncId?: string
  syncVersion?: number
}
