import type { NativeHealthDeviceType } from './NativeHealthDeviceInfo'
import type { NativeHealthRecordingMethod } from './NativeHealthRecordingMethod'

/** Native provenance supplied when writing a health record. */
export interface NativeHealthWriteProvenance {
  deviceType?: NativeHealthDeviceType
  deviceManufacturer?: string
  deviceModel?: string
  recordingMethod?: NativeHealthRecordingMethod
}
