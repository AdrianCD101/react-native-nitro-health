import type { HealthRecordSync } from './HealthRecordSync'

/** VO2 max sample accepted by {@linkcode NitroHealth.saveVo2Max}. */
export interface Vo2MaxSampleInput {
  /** Instant the reading was taken. */
  date: Date
  /**
   * Maximal oxygen consumption in milliliters per kilogram of body mass per minute.
   * Must be between 0 and 100 inclusive.
   */
  millilitersPerKilogramPerMinute: number
  /** Optional logical identity that makes retries idempotent and higher versions replace. */
  sync?: HealthRecordSync
}
