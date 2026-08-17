import type { NativeHealthDeviceInfo } from './NativeHealthDeviceInfo'
import type { NativeHealthRecordingMethod } from './NativeHealthRecordingMethod'

/** Native heart rate sample input shape passed through the Nitro spec. */
export interface NativeHeartRateSampleInput {
  timeMs: number
  bpm: number
  device?: NativeHealthDeviceInfo
  recordingMethod?: NativeHealthRecordingMethod
  syncId?: string
  syncVersion?: number
}
