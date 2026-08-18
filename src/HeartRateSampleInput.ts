import type { HealthWriteMetadataInput } from './HealthWriteMetadataInput'

/** Heart rate sample accepted by {@linkcode NitroHealth.saveHeartRate}. */
export interface HeartRateSampleInput extends HealthWriteMetadataInput {
  /** Instant the reading was taken. */
  date: Date
  /**
   * Heart rate in beats per minute. Must be between 1 and 300 (the range Health Connect
   * accepts). Android stores whole bpm, so fractional values are rounded to the nearest
   * integer there; iOS stores the exact value.
   */
  bpm: number
}
