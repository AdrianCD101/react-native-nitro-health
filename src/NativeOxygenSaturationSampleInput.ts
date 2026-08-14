import type { NativeHealthRecordingMethod } from './NativeHealthRecordingMethod'

/** Native oxygen saturation sample input shape passed through the Nitro spec. */
export interface NativeOxygenSaturationSampleInput {
  timeMs: number
  percentage: number
  recordingMethod?: NativeHealthRecordingMethod
  syncId?: string
  syncVersion?: number
}
