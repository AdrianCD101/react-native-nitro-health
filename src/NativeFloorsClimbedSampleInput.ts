import type { NativeHealthRecordingMethod } from './NativeHealthRecordingMethod'

/** Native floors climbed sample input shape passed through the Nitro spec. */
export interface NativeFloorsClimbedSampleInput {
  startTimeMs: number
  endTimeMs: number
  floors: number
  recordingMethod?: NativeHealthRecordingMethod
  syncId?: string
  syncVersion?: number
}
