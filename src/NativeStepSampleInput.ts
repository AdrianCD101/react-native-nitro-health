import type { NativeHealthRecordingMethod } from './NativeHealthRecordingMethod'

/** Native step sample input shape passed through the Nitro spec. */
export interface NativeStepSampleInput {
  startTimeMs: number
  endTimeMs: number
  count: number
  recordingMethod?: NativeHealthRecordingMethod
  syncId?: string
  syncVersion?: number
}
