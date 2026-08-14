import type { NativeHealthRecordingMethod } from './NativeHealthRecordingMethod'
import type { NativeSleepSessionStageInput } from './NativeSleepSessionStageInput'

/** Native sleep session input using epoch-millisecond timestamps. */
export interface NativeSleepSessionInput {
  startTimeMs: number
  endTimeMs: number
  stages: NativeSleepSessionStageInput[]
  timeZone?: string
  recordingMethod?: NativeHealthRecordingMethod
}
