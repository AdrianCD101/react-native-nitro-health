import type { SleepStage } from './SleepStage'

/** Sleep interval returned by {@linkcode NitroHealth.readSleepSamples}. */
export interface SleepSample {
  /**
   * Stable sample identifier. The HealthKit sample UUID on iOS. On Android,
   * Health Connect stores stages inside a session record, so each stage gets
   * the session record id plus a `#index` suffix; a session without stages
   * keeps the plain record id.
   */
  uuid: string
  /** Start of the sleep interval. */
  startDate: Date
  /** End of the sleep interval. */
  endDate: Date
  /** Normalized sleep stage for this interval. */
  stage: SleepStage
  /** Originating app or device, when available. */
  source?: string
}
