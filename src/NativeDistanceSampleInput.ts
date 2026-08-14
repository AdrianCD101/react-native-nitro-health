import type { NativeDistanceScope } from './NativeDistanceWriteResult'
import type { NativeHealthRecordingMethod } from './NativeHealthRecordingMethod'

/** Native distance sample input shape passed through the Nitro spec. */
export interface NativeDistanceSampleInput {
  startTimeMs: number
  endTimeMs: number
  distanceMeters: number
  scope: NativeDistanceScope
  recordingMethod?: NativeHealthRecordingMethod
  syncId?: string
  syncVersion?: number
}
