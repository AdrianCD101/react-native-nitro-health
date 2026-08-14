import type { NativeHealthDataOrigin } from './NativeHealthDataOrigin'
import type { NativeHealthRecordingMethod } from './NativeHealthRecordingMethod'
import type { NativeHealthSampleIdentity } from './NativeHealthSampleIdentity'
import type {
  NativeBloodPressureBodyPosition,
  NativeBloodPressureMeasurementLocation,
} from './NativeBloodPressureMetadata'

/** Native blood pressure sample shape returned through the Nitro spec. */
export interface NativeBloodPressureSample {
  identity: NativeHealthSampleIdentity
  origin: NativeHealthDataOrigin
  recordingMethod: NativeHealthRecordingMethod
  timeMs: number
  systolicMmHg: number
  diastolicMmHg: number
  androidBodyPosition?: NativeBloodPressureBodyPosition
  androidMeasurementLocation?: NativeBloodPressureMeasurementLocation
}
