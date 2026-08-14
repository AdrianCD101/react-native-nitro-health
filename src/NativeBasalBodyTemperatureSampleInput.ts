import type {
  NativeAndroidBodyTemperatureMeasurementLocation,
  NativeIOSBodyTemperatureSensorLocation,
} from './NativeBodyTemperatureMetadata'
import type { NativeHealthRecordingMethod } from './NativeHealthRecordingMethod'

/** Native basal body temperature sample input shape passed through the Nitro spec. */
export interface NativeBasalBodyTemperatureSampleInput {
  timeMs: number
  celsius: number
  recordingMethod?: NativeHealthRecordingMethod
  androidMeasurementLocation?: NativeAndroidBodyTemperatureMeasurementLocation
  iosSensorLocation?: NativeIOSBodyTemperatureSensorLocation
  syncId?: string
  syncVersion?: number
}
