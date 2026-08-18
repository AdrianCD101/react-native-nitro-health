import type { HealthWriteMetadataInput } from './HealthWriteMetadataInput'
import type { Vo2MaxMetadata } from './Vo2MaxMetadata'

/** VO2 max sample accepted by {@linkcode NitroHealth.saveVo2Max}. */
export interface Vo2MaxSampleInput extends HealthWriteMetadataInput {
  /** Instant the reading was taken. */
  date: Date
  /**
   * Maximal oxygen consumption in milliliters per kilogram of body mass per minute.
   * Must be between 0 and 100 inclusive.
   */
  millilitersPerKilogramPerMinute: number
  /** Platform-scoped details to preserve on the platform that owns each field. */
  metadata?: Vo2MaxMetadata
}
