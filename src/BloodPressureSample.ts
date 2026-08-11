import type { HealthSample } from './HealthSample'

/**
 * Blood pressure reading returned by {@linkcode NitroHealth.readBloodPressure}.
 *
 * One sample always carries both values. Android maps a Health Connect
 * `BloodPressureRecord` one-to-one; iOS unpacks the `HKCorrelation` that stores the
 * systolic and diastolic member samples, and `identity` is the correlation record.
 */
export interface BloodPressureSample extends HealthSample {
  /** Instant the reading was taken. */
  date: Date
  /** Systolic pressure in millimeters of mercury. */
  systolicMmHg: number
  /** Diastolic pressure in millimeters of mercury. */
  diastolicMmHg: number
}
