import type { NativeHealthRecordingMethod } from './NativeHealthRecordingMethod'

/** Native lean body mass sample input shape passed through the Nitro spec. */
export interface NativeLeanBodyMassSampleInput {
  timeMs: number
  kilograms: number
  recordingMethod?: NativeHealthRecordingMethod
  syncId?: string
  syncVersion?: number
}
