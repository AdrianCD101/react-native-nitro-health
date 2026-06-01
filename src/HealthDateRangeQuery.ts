/** Date range query used by health read APIs such as {@linkcode NitroHealth.readSteps}. */
export interface HealthDateRangeQuery {
  /** Inclusive start of the query range. Must be before {@linkcode endDate}. */
  startDate: Date
  /** Exclusive end of the query range. Must be after {@linkcode startDate}. */
  endDate: Date
  /** Maximum number of samples to return. Defaults to 1000. */
  limit?: number
  /** Whether results should be sorted oldest first. Defaults to true. */
  ascending?: boolean
}
