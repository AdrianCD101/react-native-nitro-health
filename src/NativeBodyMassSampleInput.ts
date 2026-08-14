import type { NativeHealthRecordingMethod } from './NativeHealthRecordingMethod'

/** Native body mass sample input shape passed through the Nitro spec. */
export interface NativeBodyMassSampleInput {
  timeMs: number
  kilograms: number
  recordingMethod?: NativeHealthRecordingMethod
  syncId?: string
  syncVersion?: number
}
