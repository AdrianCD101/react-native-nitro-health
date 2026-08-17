import type {
  NativeBloodPressureBodyPosition,
  NativeBloodPressureMeasurementLocation,
} from './NativeBloodPressureMetadata'
import type { NativeHealthDeviceInfo } from './NativeHealthDeviceInfo'
import type { NativeHealthRecordingMethod } from './NativeHealthRecordingMethod'

/** Native blood pressure sample input shape passed through the Nitro spec. */
export interface NativeBloodPressureSampleInput {
  timeMs: number
  systolicMmHg: number
  diastolicMmHg: number
  device?: NativeHealthDeviceInfo
  recordingMethod?: NativeHealthRecordingMethod
  androidBodyPosition?: NativeBloodPressureBodyPosition
  androidMeasurementLocation?: NativeBloodPressureMeasurementLocation
  syncId?: string
  syncVersion?: number
}
