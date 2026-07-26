/** Active energy interval returned by {@linkcode NitroHealth.readActiveEnergyBurned}. */
export interface ActiveEnergyBurnedSample {
  /** Stable sample identifier: the HealthKit sample UUID on iOS, the Health Connect record id on Android. */
  uuid: string
  /** Inclusive start of the sample interval. */
  startDate: Date
  /** Exclusive end of the sample interval. */
  endDate: Date
  /** Active energy burned in kilocalories. */
  kilocalories: number
}
