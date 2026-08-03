import type { HealthSampleIdentity } from './HealthSampleIdentity'
import type { SleepStage } from './SleepStage'

/** Sleep interval returned by {@linkcode NitroHealth.readSleepSamples}. */
export interface SleepSample extends HealthSampleIdentity {
  /** Start of the sleep interval. */
  startDate: Date
  /** End of the sleep interval. */
  endDate: Date
  /** Normalized sleep stage for this interval. */
  stage: SleepStage
  /** Originating app or device, when available. */
  source?: string
}
