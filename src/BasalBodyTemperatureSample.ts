import type { BodyTemperatureMetadata } from './BodyTemperatureMetadata'
import type { HealthSample } from './HealthSample'

/** Basal body temperature sample returned by {@linkcode NitroHealth.readBasalBodyTemperature}. */
export interface BasalBodyTemperatureSample extends HealthSample {
  /** Instant the reading was taken. */
  date: Date
  /** Basal body temperature in degrees Celsius (°F = °C × 9/5 + 32). */
  celsius: number
  /** Platform-scoped fields retained by the native health store. */
  metadata?: BodyTemperatureMetadata
}
