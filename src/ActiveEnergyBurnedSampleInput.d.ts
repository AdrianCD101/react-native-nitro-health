/** Active energy sample accepted by {@linkcode NitroHealth.saveActiveEnergyBurned}. */
export interface ActiveEnergyBurnedSampleInput {
  /** Sample start time. */
  startDate: Date
  /** Sample end time. */
  endDate: Date
  /** Active energy burned during the sample range, in kilocalories (0 to 1,000,000). */
  kilocalories: number
}
