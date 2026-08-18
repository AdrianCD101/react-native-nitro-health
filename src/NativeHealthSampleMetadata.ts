import type { NativeHealthDeviceType } from './NativeHealthDeviceInfo'
import type { NativeHealthRecordingMethod } from './NativeHealthRecordingMethod'
import type { NativeHealthSampleIdentityKind } from './NativeHealthSampleIdentity'

/** Native provenance attached to a health sample returned through Nitro. */
export interface NativeHealthSampleMetadata {
  identityKind: NativeHealthSampleIdentityKind
  identityId: string
  identityRecordId: string
  originIdentifier: string
  originDisplayName?: string
  deviceType?: NativeHealthDeviceType
  deviceManufacturer?: string
  deviceModel?: string
  recordingMethod: NativeHealthRecordingMethod
  zoneOffset?: string
  timeZone?: string
}
