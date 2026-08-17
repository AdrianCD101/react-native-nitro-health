import type {
  NativeAndroidBodyTemperatureMeasurementLocation,
  NativeIOSBodyTemperatureSensorLocation,
} from './NativeBodyTemperatureMetadata'
import type { NativeHealthWriteMetadata } from './NativeHealthWriteMetadata'

/** Native basal body temperature sample input shape passed through the Nitro spec. */
export interface NativeBasalBodyTemperatureSampleInput {
  timeMs: number
  celsius: number
  writeMetadata: NativeHealthWriteMetadata
  androidMeasurementLocation?: NativeAndroidBodyTemperatureMeasurementLocation
  iosSensorLocation?: NativeIOSBodyTemperatureSensorLocation
}
