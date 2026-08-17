import type { ChangeTrackedHealthDataType } from './HealthDataType'
import type { HealthRecordChange } from './HealthRecordChange'

/** Result returned by {@linkcode NitroHealth.getChanges}. */
export type HealthChangesResult<T extends ChangeTrackedHealthDataType> =
  | {
      /** The checkpoint is no longer usable and a full resync is required. */
      tokenExpired: true
    }
  | {
      /** The checkpoint remains usable. */
      tokenExpired: false
      /** Record changes in processing order; no chronological ordering is guaranteed. */
      changes: HealthRecordChange<T>[]
      /** Opaque checkpoint to persist only after applying this page successfully. */
      nextChangesToken: string
      /** Whether another page should be fetched immediately with the next token. */
      hasMore: boolean
    }
