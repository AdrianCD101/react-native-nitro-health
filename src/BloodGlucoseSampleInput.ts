import type { HealthWriteMetadataInput } from './HealthWriteMetadataInput'
import type { BloodGlucoseMetadata } from './BloodGlucoseMetadata'

/** Blood glucose sample accepted by {@linkcode NitroHealth.saveBloodGlucose}. */
export interface BloodGlucoseSampleInput extends HealthWriteMetadataInput {
  /** Instant the reading was taken. */
  date: Date
  /** Blood glucose concentration in millimoles per liter. Must be between 0.5 and 50 inclusive. */
  millimolesPerLiter: number
  /** Platform-scoped fields retained by the native health store. */
  metadata?: BloodGlucoseMetadata
}
