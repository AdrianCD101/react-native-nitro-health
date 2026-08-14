import type {
  NativeBloodPressureBodyPosition,
  NativeBloodPressureMeasurementLocation,
} from './NativeBloodPressureMetadata'
import type { NativeHealthRecordingMethod } from './NativeHealthRecordingMethod'

/** Native blood pressure sample input shape passed through the Nitro spec. */
export interface NativeBloodPressureSampleInput {
  timeMs: number
  systolicMmHg: number
  diastolicMmHg: number
  recordingMethod?: NativeHealthRecordingMethod
  androidBodyPosition?: NativeBloodPressureBodyPosition
  androidMeasurementLocation?: NativeBloodPressureMeasurementLocation
  syncId?: string
  syncVersion?: number
}
