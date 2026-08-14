import type { NativeHealthRecordingMethod } from './NativeHealthRecordingMethod'

/** Native respiratory rate sample input shape passed through the Nitro spec. */
export interface NativeRespiratoryRateSampleInput {
  timeMs: number
  breathsPerMinute: number
  recordingMethod?: NativeHealthRecordingMethod
  syncId?: string
  syncVersion?: number
}
