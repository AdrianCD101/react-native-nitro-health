import type { HealthSampleIdentity } from './HealthSampleIdentity'

/** Oxygen saturation sample returned by {@linkcode NitroHealth.readOxygenSaturation}. */
export interface OxygenSaturationSample extends HealthSampleIdentity {
  /** Instant the reading was taken. */
  date: Date
  /** Oxygen saturation as a percentage (0-100), converted from HealthKit's 0-1 fraction on iOS. */
  percentage: number
  /** Originating app or device, when available. */
  source?: string
}
