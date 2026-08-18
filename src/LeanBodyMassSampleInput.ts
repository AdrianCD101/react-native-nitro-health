import type { HealthWriteMetadataInput } from './HealthWriteMetadataInput'

/** Lean body mass sample accepted by {@linkcode NitroHealth.saveLeanBodyMass}. */
export interface LeanBodyMassSampleInput extends HealthWriteMetadataInput {
  /** Instant the reading was taken. */
  date: Date
  /** Lean body mass in kilograms. Must be greater than 0 and at most 1,000. */
  kilograms: number
}
