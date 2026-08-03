import type { HealthSampleIdentity } from './HealthSampleIdentity'

/** Height sample returned by {@linkcode NitroHealth.readHeight}. */
export interface HeightSample extends HealthSampleIdentity {
  /** Instant the measurement was taken. */
  date: Date
  /** Height in meters. */
  meters: number
  /** Originating app or device, when available. */
  source?: string
}
