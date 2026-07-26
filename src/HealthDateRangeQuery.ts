/** Date range query used by health read APIs such as {@linkcode NitroHealth.readSteps}. */
export interface HealthDateRangeQuery {
  /** Inclusive start of the query range. Must be before {@linkcode endDate}. */
  startDate: Date
  /** Exclusive end of the query range. Must be after {@linkcode startDate}. */
  endDate: Date
  /**
   * Maximum number of samples per page. Defaults to 1000.
   *
   * On Android, heart rate and sleep reads page by underlying Health Connect
   * record, so a page may contain more samples than `limit` when records hold
   * multiple readings.
   */
  limit?: number
  /** Whether results should be sorted oldest first. Defaults to true. */
  ascending?: boolean
  /**
   * Opaque pagination cursor obtained from a previous page's
   * {@linkcode HealthSamplePage.nextCursor}. Omit to read the first page.
   *
   * A cursor is platform-specific and only valid for a query with the same
   * `startDate`, `endDate`, and `ascending` that produced it. Treat cursors as
   * short-lived; do not persist them.
   */
  cursor?: string
}
