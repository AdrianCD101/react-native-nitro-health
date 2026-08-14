import type { BodyTemperatureMetadata } from './BodyTemperatureMetadata'
import type { HealthRecordSync } from './HealthRecordSync'

/** Basal body temperature sample accepted by {@linkcode NitroHealth.saveBasalBodyTemperature}. */
export interface BasalBodyTemperatureSampleInput {
  /** Instant the reading was taken. */
  date: Date
  /** Basal body temperature in degrees Celsius. Must be between 20 and 45 inclusive. */
  celsius: number
  /** Platform-scoped fields retained by the native health store. */
  metadata?: BodyTemperatureMetadata
  /** Optional logical identity that makes retries idempotent and higher versions replace. */
  sync?: HealthRecordSync
}
