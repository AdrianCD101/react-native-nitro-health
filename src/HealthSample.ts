import type { HealthDataOrigin } from './HealthDataOrigin'
import type { HealthDeviceInfo } from './HealthDeviceInfo'
import type { HealthRecordingMethod } from './HealthRecordingMethod'
import type { HealthSampleIdentity } from './HealthSampleIdentity'

/** Fields shared by every raw health sample. */
export interface HealthSample {
  /** Physical identity and deletion scope of this sample. */
  identity: HealthSampleIdentity
  /** Application that originally recorded this sample. */
  origin: HealthDataOrigin
  /** Physical device that generated this sample, when reported. */
  device?: HealthDeviceInfo
  /** Method retained by the native health service for this sample. */
  recordingMethod: HealthRecordingMethod
  /**
   * UTC offset the sample was recorded at (e.g. `"+09:00"`), when the store
   * retains one. Android surfaces the record's stored zone offset; iOS derives
   * it from the stored time-zone name at the sample's start date. Absent when
   * the writer stored no zone — never fabricated from the reader's zone.
   */
  zoneOffset?: string
  /**
   * IANA time-zone name the sample was recorded in, when the store retains
   * one. Only HealthKit stores names (`HKMetadataKeyTimeZone`), so this is
   * absent on Android and on iOS samples whose writer did not attach it.
   */
  timeZone?: string
}
