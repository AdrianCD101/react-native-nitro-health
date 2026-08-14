import type { NativeHealthRecordingMethod } from './NativeHealthRecordingMethod'

/** Native hydration sample input shape passed through the Nitro spec. */
export interface NativeHydrationSampleInput {
  startTimeMs: number
  endTimeMs: number
  milliliters: number
  recordingMethod?: NativeHealthRecordingMethod
  syncId?: string
  syncVersion?: number
}
