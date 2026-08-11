import type { HealthSample } from './HealthSample'

/** Blood glucose sample returned by {@linkcode NitroHealth.readBloodGlucose}. */
export interface BloodGlucoseSample extends HealthSample {
  /** Instant the reading was taken. */
  date: Date
  /** Blood glucose concentration in millimoles per liter (mg/dL = mmol/L × 18.0182). */
  millimolesPerLiter: number
}
