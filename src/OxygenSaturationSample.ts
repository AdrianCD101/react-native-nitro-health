import type { HealthSample } from './HealthSample'

/** Oxygen saturation sample returned by {@linkcode NitroHealth.readOxygenSaturation}. */
export interface OxygenSaturationSample extends HealthSample {
  /** Instant the reading was taken. */
  date: Date
  /** Oxygen saturation as a percentage (0-100), converted from HealthKit's 0-1 fraction on iOS. */
  percentage: number
}
