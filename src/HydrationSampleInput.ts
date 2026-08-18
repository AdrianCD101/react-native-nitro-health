import type { HealthWriteMetadataInput } from './HealthWriteMetadataInput'

/** Hydration sample accepted by {@linkcode NitroHealth.saveHydration}. */
export interface HydrationSampleInput extends HealthWriteMetadataInput {
  /** Sample start time. */
  startDate: Date
  /** Sample end time. */
  endDate: Date
  /** Water consumed during the sample range, in milliliters (0 to 100,000). */
  milliliters: number
}
