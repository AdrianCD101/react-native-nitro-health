/** Native daily step total bucket returned through the Nitro spec. Aggregated buckets carry no identity. */
export interface NativeDailyStepTotal {
  startTimeMs: number
  endTimeMs: number
  count: number
}
