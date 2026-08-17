import type {
  NativeBloodPressureBodyPosition,
  NativeBloodPressureMeasurementLocation,
} from './NativeBloodPressureMetadata'
import type { NativeHealthWriteMetadata } from './NativeHealthWriteMetadata'

/** Native blood pressure sample input shape passed through the Nitro spec. */
export interface NativeBloodPressureSampleInput {
  timeMs: number
  systolicMmHg: number
  diastolicMmHg: number
  writeMetadata: NativeHealthWriteMetadata
  androidBodyPosition?: NativeBloodPressureBodyPosition
  androidMeasurementLocation?: NativeBloodPressureMeasurementLocation
}
