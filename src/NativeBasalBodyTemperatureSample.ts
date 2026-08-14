import type { NativeHealthDataOrigin } from './NativeHealthDataOrigin'
import type { NativeHealthSampleIdentity } from './NativeHealthSampleIdentity'
import type {
  NativeAndroidBodyTemperatureMeasurementLocation,
  NativeIOSBodyTemperatureSensorLocation,
} from './NativeBodyTemperatureMetadata'

/** Native basal body temperature sample shape returned through the Nitro spec. */
export interface NativeBasalBodyTemperatureSample {
  identity: NativeHealthSampleIdentity
  origin: NativeHealthDataOrigin
  timeMs: number
  celsius: number
  androidMeasurementLocation?: NativeAndroidBodyTemperatureMeasurementLocation
  iosSensorLocation?: NativeIOSBodyTemperatureSensorLocation
}
