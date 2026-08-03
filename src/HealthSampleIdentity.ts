/** Identity shared by health samples returned from raw reads and change tracking. */
export interface HealthSampleIdentity {
  /**
   * Identifier of this returned sample. Android readings flattened from a
   * parent heart-rate or sleep record use `recordUuid#index`; that synthetic
   * identifier can change when the parent record's children are reordered.
   */
  uuid: string
  /**
   * Identifier of the native record that owns this sample. This equals
   * {@linkcode uuid} except for flattened Android heart-rate and sleep samples.
   * Use it to replace or remove every sample belonging to a record during sync.
   */
  recordUuid: string
}
