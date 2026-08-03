import type { HealthRecordSync } from './HealthRecordSync'

/** Active energy sample accepted by {@linkcode NitroHealth.saveActiveEnergyBurned}. */
export interface ActiveEnergyBurnedSampleInput {
  /** Sample start time. */
  startDate: Date
  /** Sample end time. */
  endDate: Date
  /** Active energy burned during the sample range, in kilocalories (0 to 1,000,000). */
  kilocalories: number
  /** Optional logical identity that makes retries idempotent and higher versions replace. */
  sync?: HealthRecordSync
}
