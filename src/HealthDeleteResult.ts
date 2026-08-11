/** Native visibility into how many records a deletion removed. */
export type HealthDeletedCount =
  | {
      /** The health service reported the exact count. */
      status: 'known'
      /** Number of records removed. */
      value: number
    }
  | {
      /** The operation completed but the health service does not expose a count. */
      status: 'unverifiable'
    }

/** Successful deletion by explicit record identity. */
export interface HealthIdentityDeleteResult {
  /** The native deletion operation completed. */
  status: 'completed'
  /** Number of record identities supplied. */
  requestedCount: number
  /** Native visibility into the number of deleted records. */
  deletedCount: HealthDeletedCount
}

/** Successful deletion by time range. */
export interface HealthTimeRangeDeleteResult {
  /** The native deletion operation completed. */
  status: 'completed'
  /** Native visibility into the number of deleted records. */
  deletedCount: HealthDeletedCount
}
