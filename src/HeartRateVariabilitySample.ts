import type { HeartRateVariabilityMethod } from './HeartRateVariabilityMethod'
import type { HealthSampleIdentity } from './HealthSampleIdentity'

/**
 * Heart rate variability sample returned by {@linkcode NitroHealth.readHeartRateVariability}.
 *
 * iOS reports HealthKit's HRV SDNN metric (`method: 'sdnn'`); Android reports Health Connect's
 * HRV RMSSD metric (`method: 'rmssd'`). SDNN and RMSSD are non-comparable — never mix or chart
 * samples with different methods together.
 */
export interface HeartRateVariabilitySample extends HealthSampleIdentity {
  /** Instant the reading was taken. */
  date: Date
  /** Heart rate variability in milliseconds. */
  milliseconds: number
  /** Metric used to compute this sample. */
  method: HeartRateVariabilityMethod
  /** Originating app or device, when available. */
  source?: string
}
