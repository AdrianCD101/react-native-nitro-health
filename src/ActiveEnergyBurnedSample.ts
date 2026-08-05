import type { HealthSample } from './HealthSample'

/** Active energy interval returned by {@linkcode NitroHealth.readActiveEnergyBurned}. */
export interface ActiveEnergyBurnedSample extends HealthSample {
  /** Inclusive start of the sample interval. */
  startDate: Date
  /** Exclusive end of the sample interval. */
  endDate: Date
  /** Active energy burned in kilocalories. */
  kilocalories: number
}
