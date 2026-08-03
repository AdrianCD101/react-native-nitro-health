import type { HealthDataType } from './HealthDataType'
import type { HealthSampleByDataType } from './HealthSampleByDataType'

/** A native record inserted, updated, or deleted since a changes token was created. */
export type HealthRecordChange<T extends HealthDataType> =
  | {
      /** Indicates that the complete current record contents are provided. */
      type: 'upsert'
      /** Native record identifier shared by every returned sample. */
      recordUuid: string
      /**
       * Complete samples represented by the record. Replace all locally cached
       * samples with this `recordUuid` rather than appending these values.
       */
      samples: HealthSampleByDataType[T][]
    }
  | {
      /** Indicates that the native record was deleted. */
      type: 'delete'
      /** Native record identifier whose locally cached samples must be removed. */
      recordUuid: string
    }
