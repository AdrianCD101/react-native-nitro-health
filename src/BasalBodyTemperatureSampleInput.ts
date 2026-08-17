import type { BodyTemperatureMetadata } from './BodyTemperatureMetadata'
import type { HealthDeviceInfo } from './HealthDeviceInfo'
import type { HealthRecordSync } from './HealthRecordSync'
import type { HealthRecordingMethod } from './HealthRecordingMethod'

/** Basal body temperature sample accepted by {@linkcode NitroHealth.saveBasalBodyTemperature}. */
export interface BasalBodyTemperatureSampleInput {
  /** Instant the reading was taken. */
  date: Date
  /** Basal body temperature in degrees Celsius. Must be between 20 and 45 inclusive. */
  celsius: number
  /** Physical device asserted as having generated this sample. */
  device?: HealthDeviceInfo
  /** Platform-scoped fields retained by the native health store. */
  metadata?: BodyTemperatureMetadata
  /**
   * Requested recording method. On iOS, active and automatic recording degrade to `unknown`.
   * @default 'unknown'
   */
  recordingMethod?: HealthRecordingMethod
  /** Optional logical identity that makes retries idempotent and higher versions replace. */
  sync?: HealthRecordSync
}
