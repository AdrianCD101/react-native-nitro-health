/**
 * Identifies one logical health record for retry-safe, versioned saves.
 *
 * @see {@linkcode NitroHealth.saveSteps}
 */
export interface HealthRecordSync {
  /** Stable, nonblank application-owned identifier scoped to one health data type. */
  id: string
  /** Non-negative safe integer that must increase whenever the logical record changes. */
  version: number
}
