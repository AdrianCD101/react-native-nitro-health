import type { NativeHealthRecordingMethod } from './NativeHealthRecordingMethod'

/** Native resting heart rate sample input shape passed through the Nitro spec. */
export interface NativeRestingHeartRateSampleInput {
  timeMs: number
  bpm: number
  recordingMethod?: NativeHealthRecordingMethod
  syncId?: string
  syncVersion?: number
}
