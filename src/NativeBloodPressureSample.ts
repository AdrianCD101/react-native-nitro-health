import type { NativeHealthSampleMetadata } from './NativeHealthSampleMetadata'
import type {
  NativeBloodPressureBodyPosition,
  NativeBloodPressureMeasurementLocation,
} from './NativeBloodPressureMetadata'

/** Native blood pressure sample shape returned through the Nitro spec. */
export interface NativeBloodPressureSample {
  sampleMetadata: NativeHealthSampleMetadata
  timeMs: number
  systolicMmHg: number
  diastolicMmHg: number
  androidBodyPosition?: NativeBloodPressureBodyPosition
  androidMeasurementLocation?: NativeBloodPressureMeasurementLocation
}
