/** Native date range query shape passed through the Nitro spec. */
export interface NativeHealthDateRangeQuery {
  startTimeMs: number
  endTimeMs: number
  limit: number
  ascending: boolean
  /** Opaque pagination cursor from a previous page's `nextCursor`. Absent for the first page. */
  cursor?: string
  /**
   * Present (and always true) only when the JS query requested `origins: 'own-app'`.
   * Mutually exclusive with `originIdentifiers`; the JS mapping layer guarantees exclusivity
   * and the native side throws if both arrive.
   */
  ownAppOnly?: boolean
  /**
   * Present only when the JS query requested specific origins. Guaranteed by the JS mapping
   * layer to be non-empty, sorted, and deduped (the canonical form bound into pagination
   * cursors). Mutually exclusive with `ownAppOnly`.
   */
  originIdentifiers?: string[]
}
