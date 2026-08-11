import type { HealthRecordSync } from './HealthRecordSync'

/** Body temperature sample accepted by {@linkcode NitroHealth.saveBodyTemperature}. */
export interface BodyTemperatureSampleInput {
  /** Instant the reading was taken. */
  date: Date
  /** Body temperature in degrees Celsius. Must be between 20 and 45 inclusive. */
  celsius: number
  /** Optional logical identity that makes retries idempotent and higher versions replace. */
  sync?: HealthRecordSync
}
