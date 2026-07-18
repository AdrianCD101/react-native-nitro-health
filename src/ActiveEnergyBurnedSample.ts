/** Active energy interval returned by {@linkcode NitroHealth.readActiveEnergyBurned}. */
export interface ActiveEnergyBurnedSample {
  /** Inclusive start of the sample interval. */
  startDate: Date
  /** Exclusive end of the sample interval. */
  endDate: Date
  /** Active energy burned in kilocalories. */
  kilocalories: number
}
