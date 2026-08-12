import type { HealthRecordSync } from './HealthRecordSync'

/** Hydration sample accepted by {@linkcode NitroHealth.saveHydration}. */
export interface HydrationSampleInput {
  /** Sample start time. */
  startDate: Date
  /** Sample end time. */
  endDate: Date
  /** Water consumed during the sample range, in milliliters (0 to 100,000). */
  milliliters: number
  /** Optional logical identity that makes retries idempotent and higher versions replace. */
  sync?: HealthRecordSync
}
