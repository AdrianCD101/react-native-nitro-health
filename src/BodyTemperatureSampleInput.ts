import type { BodyTemperatureMetadata } from './BodyTemperatureMetadata'
import type { HealthRecordSync } from './HealthRecordSync'
import type { HealthRecordingMethod } from './HealthRecordingMethod'

/** Body temperature sample accepted by {@linkcode NitroHealth.saveBodyTemperature}. */
export interface BodyTemperatureSampleInput {
  /** Instant the reading was taken. */
  date: Date
  /** Body temperature in degrees Celsius. Must be between 20 and 45 inclusive. */
  celsius: number
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
