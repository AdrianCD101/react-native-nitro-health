/**
 * Physical native identity returned by raw reads and change tracking. This is
 * distinct from the logical `sync.id` optionally supplied when writing.
 */
export interface HealthSampleIdentity {
  /**
   * Physical identifier of this returned sample. Android readings flattened
   * from a parent heart-rate or sleep record use `recordUuid#index`; that
   * synthetic identifier can change when the parent's children are reordered.
   */
  uuid: string
  /**
   * Physical identifier of the native record that owns this sample. This equals
   * {@linkcode uuid} except for flattened Android heart-rate and sleep samples.
   * Use it for change tracking, not as the logical identity of a versioned write.
   */
  recordUuid: string
}
