import type {
  NativeAndroidBodyTemperatureMeasurementLocation,
  NativeIOSBodyTemperatureSensorLocation,
} from './NativeBodyTemperatureMetadata'
import type { NativeHealthDeviceInfo } from './NativeHealthDeviceInfo'
import type { NativeHealthRecordingMethod } from './NativeHealthRecordingMethod'

/** Native basal body temperature sample input shape passed through the Nitro spec. */
export interface NativeBasalBodyTemperatureSampleInput {
  timeMs: number
  celsius: number
  device?: NativeHealthDeviceInfo
  recordingMethod?: NativeHealthRecordingMethod
  androidMeasurementLocation?: NativeAndroidBodyTemperatureMeasurementLocation
  iosSensorLocation?: NativeIOSBodyTemperatureSensorLocation
  syncId?: string
  syncVersion?: number
}
