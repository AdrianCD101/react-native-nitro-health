import type { NativeHealthRecordingMethod } from './NativeHealthRecordingMethod'

/** Native height sample input shape passed through the Nitro spec. */
export interface NativeHeightSampleInput {
  timeMs: number
  meters: number
  recordingMethod?: NativeHealthRecordingMethod
  syncId?: string
  syncVersion?: number
}
