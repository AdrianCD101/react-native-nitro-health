import type { NativeHealthDeviceInfo } from './NativeHealthDeviceInfo'
import type { NativeHealthRecordingMethod } from './NativeHealthRecordingMethod'
import type { NativeSleepSessionStageInput } from './NativeSleepSessionStageInput'

/** Native sleep session input using epoch-millisecond timestamps. */
export interface NativeSleepSessionInput {
  startTimeMs: number
  endTimeMs: number
  stages: NativeSleepSessionStageInput[]
  timeZone?: string
  device?: NativeHealthDeviceInfo
  recordingMethod?: NativeHealthRecordingMethod
}
