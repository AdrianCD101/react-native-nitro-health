import type { NativeHealthSampleMetadata } from './NativeHealthSampleMetadata'
import type {
  NativeAndroidBodyTemperatureMeasurementLocation,
  NativeIOSBodyTemperatureSensorLocation,
} from './NativeBodyTemperatureMetadata'

/** Native basal body temperature sample shape returned through the Nitro spec. */
export interface NativeBasalBodyTemperatureSample {
  sampleMetadata: NativeHealthSampleMetadata
  timeMs: number
  celsius: number
  androidMeasurementLocation?: NativeAndroidBodyTemperatureMeasurementLocation
  iosSensorLocation?: NativeIOSBodyTemperatureSensorLocation
}
