import type {
  NativeBloodPressureBodyPosition,
  NativeBloodPressureMeasurementLocation,
} from './NativeBloodPressureMetadata'

/** Native blood pressure sample input shape passed through the Nitro spec. */
export interface NativeBloodPressureSampleInput {
  timeMs: number
  systolicMmHg: number
  diastolicMmHg: number
  androidBodyPosition?: NativeBloodPressureBodyPosition
  androidMeasurementLocation?: NativeBloodPressureMeasurementLocation
  syncId?: string
  syncVersion?: number
}
