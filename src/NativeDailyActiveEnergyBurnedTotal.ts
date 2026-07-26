/** Native daily active-energy total bucket returned through the Nitro spec. Aggregated buckets carry no identity. */
export interface NativeDailyActiveEnergyBurnedTotal {
  /** Inclusive start of the day bucket as Unix epoch milliseconds. */
  startTimeMs: number
  /** Exclusive end of the day bucket as Unix epoch milliseconds. */
  endTimeMs: number
  /** Active energy burned in kilocalories. */
  kilocalories: number
}
