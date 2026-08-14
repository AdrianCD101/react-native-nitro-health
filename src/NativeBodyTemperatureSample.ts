import type { NativeHealthDataOrigin } from './NativeHealthDataOrigin'
import type { NativeHealthRecordingMethod } from './NativeHealthRecordingMethod'
import type { NativeHealthSampleIdentity } from './NativeHealthSampleIdentity'
import type {
  NativeAndroidBodyTemperatureMeasurementLocation,
  NativeIOSBodyTemperatureSensorLocation,
} from './NativeBodyTemperatureMetadata'

/** Native body temperature sample shape returned through the Nitro spec. */
export interface NativeBodyTemperatureSample {
  identity: NativeHealthSampleIdentity
  origin: NativeHealthDataOrigin
  recordingMethod: NativeHealthRecordingMethod
  timeMs: number
  celsius: number
  androidMeasurementLocation?: NativeAndroidBodyTemperatureMeasurementLocation
  iosSensorLocation?: NativeIOSBodyTemperatureSensorLocation
}
