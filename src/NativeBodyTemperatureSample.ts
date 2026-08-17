import type { NativeHealthSampleMetadata } from './NativeHealthSampleMetadata'
import type {
  NativeAndroidBodyTemperatureMeasurementLocation,
  NativeIOSBodyTemperatureSensorLocation,
} from './NativeBodyTemperatureMetadata'

/** Native body temperature sample shape returned through the Nitro spec. */
export interface NativeBodyTemperatureSample {
  sampleMetadata: NativeHealthSampleMetadata
  timeMs: number
  celsius: number
  androidMeasurementLocation?: NativeAndroidBodyTemperatureMeasurementLocation
  iosSensorLocation?: NativeIOSBodyTemperatureSensorLocation
}
