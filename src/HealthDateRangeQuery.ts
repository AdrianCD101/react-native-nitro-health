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
   * Restrict results to samples recorded by specific applications, matched against
   * {@linkcode HealthDataOrigin.identifier}.
   *
   * `'own-app'` — the only portable spelling — returns only samples the calling
   * application recorded. An identifier array restricts results to the listed
   * applications; identifiers are platform-native values (a bundle identifier on iOS,
   * a package name on Android) and are never portable across platforms. Obtain them
   * from {@linkcode HealthSample.origin} on samples read on the same platform, or from
   * {@linkcode NitroHealth.ownOrigin}.
   *
   * An identifier that matches no data source yields empty results rather than an
   * error — indistinguishable from that application having recorded no data in the
   * range. An empty array is invalid and throws. Duplicate identifiers are collapsed.
   *
   * Omit to read samples from every application.
   */
  origins?: 'own-app' | string[]
  /**
   * Opaque pagination cursor obtained from a previous page's
   * {@linkcode HealthSamplePage.nextCursor}. Omit to read the first page.
   *
   * A cursor is platform-specific and only valid for a query with the same
   * `startDate`, `endDate`, `ascending`, and `origins` that produced it. Treat
   * cursors as short-lived; do not persist them. Data sources that first appear
   * between pages may contribute samples to later pages, just as newly written
   * samples can.
   */
  cursor?: string
}
