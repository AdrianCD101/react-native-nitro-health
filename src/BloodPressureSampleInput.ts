import type { BloodPressureMetadata } from './BloodPressureMetadata'
import type { HealthRecordSync } from './HealthRecordSync'

/** Blood pressure reading accepted by {@linkcode NitroHealth.saveBloodPressure}. */
export interface BloodPressureSampleInput {
  /** Instant the reading was taken. */
  date: Date
  /** Systolic pressure in millimeters of mercury. Must be between 20 and 200 inclusive. */
  systolicMmHg: number
  /** Diastolic pressure in millimeters of mercury. Must be between 10 and 180 inclusive. */
  diastolicMmHg: number
  /** Platform-scoped fields retained by the native health store. */
  metadata?: BloodPressureMetadata
  /** Optional logical identity that makes retries idempotent and higher versions replace. */
  sync?: HealthRecordSync
}
