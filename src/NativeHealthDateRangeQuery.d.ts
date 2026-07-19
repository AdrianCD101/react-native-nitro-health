/** Native date range query shape passed through the Nitro spec. */
export interface NativeHealthDateRangeQuery {
  startTimeMs: number
  endTimeMs: number
  limit: number
  ascending: boolean
}
