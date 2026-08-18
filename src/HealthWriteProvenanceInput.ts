import type { HealthDeviceInfo } from './HealthDeviceInfo'
import type { HealthRecordingMethod } from './HealthRecordingMethod'

/** Provenance fields shared by every sample write input. */
export interface HealthWriteProvenanceInput {
  /** Physical device asserted as having generated this sample. */
  device?: HealthDeviceInfo
  /**
   * Requested recording method. On iOS, active and automatic recording degrade to `unknown`.
   * @default 'unknown'
   */
  recordingMethod?: HealthRecordingMethod
  /**
   * IANA time-zone identifier the record was captured in. Defaults to the device's
   * current time zone at write time. Android stores it as the record's zone offset;
   * iOS stores the identifier as `HKMetadataKeyTimeZone`.
   */
  timeZone?: string
}
