import type { NativeHealthRecordingMethod } from './NativeHealthRecordingMethod'

/** Native workout input using epoch-millisecond timestamps. */
export interface NativeWorkoutSampleInput {
  startTimeMs: number
  endTimeMs: number
  activityType: string
  displayName?: string
  timeZone?: string
  recordingMethod?: NativeHealthRecordingMethod
  syncId?: string
  syncVersion?: number
}
