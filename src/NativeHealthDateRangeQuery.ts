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
   * Mutually exclusive with a non-empty `originIdentifiers`; the JS mapping layer guarantees
   * exclusivity and the native side throws if both arrive.
   */
  ownAppOnly?: boolean
  /**
   * Origin identifiers the query is restricted to, always present. An empty array means
   * "no identifier filter" — safe as a sentinel because the JS mapping layer rejects
   * user-supplied empty arrays before they reach the wire. A non-empty array is guaranteed
   * to be sorted and deduped (the canonical form bound into pagination cursors).
   *
   * Deliberately non-optional: a `std::optional<std::vector<std::string>>` struct field
   * combined with nitrogen's defaulted `operator==` breaks Swift's `std::vector<std::string>`
   * collection conformance module-wide (mrousavy/nitro#1376, #1186).
   */
  originIdentifiers: string[]
}
