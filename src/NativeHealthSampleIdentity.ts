export type NativeHealthSampleIdentityKind = 'record' | 'recordChild'

/** Native transport for a record or record-child identity. */
export interface NativeHealthSampleIdentity {
  kind: NativeHealthSampleIdentityKind
  id: string
  recordId: string
}
