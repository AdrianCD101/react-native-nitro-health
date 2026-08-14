import type { NativeHealthRecordingMethod } from './NativeHealthRecordingMethod'

/** Native heart rate sample input shape passed through the Nitro spec. */
export interface NativeHeartRateSampleInput {
  timeMs: number
  bpm: number
  recordingMethod?: NativeHealthRecordingMethod
  syncId?: string
  syncVersion?: number
}
