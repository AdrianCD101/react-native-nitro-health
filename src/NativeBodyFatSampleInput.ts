import type { NativeHealthRecordingMethod } from './NativeHealthRecordingMethod'

/** Native body fat sample input shape passed through the Nitro spec. */
export interface NativeBodyFatSampleInput {
  timeMs: number
  percentage: number
  recordingMethod?: NativeHealthRecordingMethod
  syncId?: string
  syncVersion?: number
}
