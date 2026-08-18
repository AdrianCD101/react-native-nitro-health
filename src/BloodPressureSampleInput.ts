import type { HealthWriteMetadataInput } from './HealthWriteMetadataInput'
import type { BloodPressureMetadata } from './BloodPressureMetadata'

/** Blood pressure reading accepted by {@linkcode NitroHealth.saveBloodPressure}. */
export interface BloodPressureSampleInput extends HealthWriteMetadataInput {
  /** Instant the reading was taken. */
  date: Date
  /** Systolic pressure in millimeters of mercury. Must be between 20 and 200 inclusive. */
  systolicMmHg: number
  /** Diastolic pressure in millimeters of mercury. Must be between 10 and 180 inclusive. */
  diastolicMmHg: number
  /** Platform-scoped fields retained by the native health store. */
  metadata?: BloodPressureMetadata
}
