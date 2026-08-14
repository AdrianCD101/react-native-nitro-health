import type {
  NativeAndroidBodyTemperatureMeasurementLocation,
  NativeIOSBodyTemperatureSensorLocation,
} from './NativeBodyTemperatureMetadata'

/** Native body temperature sample input shape passed through the Nitro spec. */
export interface NativeBodyTemperatureSampleInput {
  timeMs: number
  celsius: number
  androidMeasurementLocation?: NativeAndroidBodyTemperatureMeasurementLocation
  iosSensorLocation?: NativeIOSBodyTemperatureSensorLocation
  syncId?: string
  syncVersion?: number
}
