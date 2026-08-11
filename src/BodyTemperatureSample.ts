import type { HealthSample } from './HealthSample'

/** Body temperature sample returned by {@linkcode NitroHealth.readBodyTemperature}. */
export interface BodyTemperatureSample extends HealthSample {
  /** Instant the reading was taken. */
  date: Date
  /** Body temperature in degrees Celsius (°F = °C × 9/5 + 32). */
  celsius: number
}
