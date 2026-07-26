/**
 * One page of samples returned by raw sample reads such as
 * {@linkcode NitroHealth.readSteps} or {@linkcode NitroHealth.readWorkouts}.
 *
 * @see {@linkcode HealthDateRangeQuery.cursor}
 */
export interface HealthSamplePage<TSample> {
  /** Samples in this page, ordered per the query's `ascending` option. */
  samples: TSample[]
  /**
   * Opaque cursor for fetching the next page. Present if and only if more data
   * exists. Pass it as {@linkcode HealthDateRangeQuery.cursor} on a query with
   * the same `startDate`, `endDate`, and `ascending` to continue reading.
   */
  nextCursor?: string
}
