import type { HealthSample } from './HealthSample'

/** Hydration interval returned by {@linkcode NitroHealth.readHydration}. */
export interface HydrationSample extends HealthSample {
  /** Inclusive start of the sample interval. */
  startDate: Date
  /** Exclusive end of the sample interval. */
  endDate: Date
  /** Water consumed during the sample interval, in milliliters. */
  milliliters: number
}
