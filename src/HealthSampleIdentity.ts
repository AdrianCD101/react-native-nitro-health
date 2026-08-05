/** Physical identity of one independently deletable native health record. */
export interface HealthRecordIdentity {
  /** Identifies an independently deletable native record. */
  kind: 'record'
  /** Native record identifier. */
  id: string
}

/** Physical identity of a reading or stage owned by a parent native record. */
export interface HealthRecordChildIdentity {
  /** Identifies a child that cannot be deleted independently. */
  kind: 'record-child'
  /** Returned child identifier. It may be synthetic and unstable. */
  id: string
  /** Independently deletable parent record. */
  record: HealthRecordIdentity
}

/** Physical native identity returned by raw reads and change tracking. */
export type HealthSampleIdentity = HealthRecordIdentity | HealthRecordChildIdentity
