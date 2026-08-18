import type { HealthWriteMetadataInput } from './HealthWriteMetadataInput'

/** Height sample accepted by {@linkcode NitroHealth.saveHeight}. */
export interface HeightSampleInput extends HealthWriteMetadataInput {
  /** Instant the measurement was taken. */
  date: Date
  /** Height in meters. Must be greater than 0 and no more than 3. */
  meters: number
}
