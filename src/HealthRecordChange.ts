import type { ChangeTrackedHealthDataType } from './HealthDataType'
import type { HealthSampleByDataType } from './HealthSampleByDataType'
import type { HealthRecordIdentity } from './HealthSampleIdentity'

/** A native record inserted, updated, or deleted since a changes token was created. */
export type HealthRecordChange<T extends ChangeTrackedHealthDataType> =
  | {
      /** Indicates that the complete current record contents are provided. */
      type: 'upsert'
      /** Native record represented by every returned sample. */
      record: HealthRecordIdentity
      /**
       * Complete samples represented by the record. Replace all locally cached
       * samples owned by this record rather than appending these values.
       */
      samples: HealthSampleByDataType[T][]
    }
  | {
      /** Indicates that the native record was deleted. */
      type: 'delete'
      /** Native record whose locally cached samples must be removed. */
      record: HealthRecordIdentity
    }
