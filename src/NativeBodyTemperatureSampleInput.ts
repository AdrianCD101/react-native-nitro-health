import type {
  NativeAndroidBodyTemperatureMeasurementLocation,
  NativeIOSBodyTemperatureSensorLocation,
} from './NativeBodyTemperatureMetadata'
import type { NativeHealthRecordingMethod } from './NativeHealthRecordingMethod'

/** Native body temperature sample input shape passed through the Nitro spec. */
export interface NativeBodyTemperatureSampleInput {
  timeMs: number
  celsius: number
  recordingMethod?: NativeHealthRecordingMethod
  androidMeasurementLocation?: NativeAndroidBodyTemperatureMeasurementLocation
  iosSensorLocation?: NativeIOSBodyTemperatureSensorLocation
  syncId?: string
  syncVersion?: number
}
