import type { HealthSample } from './HealthSample'
import type { Vo2MaxMetadata } from './Vo2MaxMetadata'

/** VO2 max sample returned by {@linkcode NitroHealth.readVo2Max}. */
export interface Vo2MaxSample extends HealthSample {
  /** Instant the reading was taken. */
  date: Date
  /** Maximal oxygen consumption in milliliters per kilogram of body mass per minute. */
  millilitersPerKilogramPerMinute: number
  /** Platform-scoped details about how the reading was measured or estimated. */
  metadata?: Vo2MaxMetadata
}
