import type { NativeDistanceScope } from './NativeDistanceWriteResult'
import type { NativeHealthDeviceInfo } from './NativeHealthDeviceInfo'
import type { NativeHealthRecordingMethod } from './NativeHealthRecordingMethod'

/** Native distance sample input shape passed through the Nitro spec. */
export interface NativeDistanceSampleInput {
  startTimeMs: number
  endTimeMs: number
  distanceMeters: number
  scope: NativeDistanceScope
  device?: NativeHealthDeviceInfo
  recordingMethod?: NativeHealthRecordingMethod
  syncId?: string
  syncVersion?: number
}
