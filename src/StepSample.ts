import type { HealthSample } from './HealthSample'

/** Step count sample returned by {@linkcode NitroHealth.readSteps}. */
export interface StepSample extends HealthSample {
  /** Sample start time. */
  startDate: Date
  /** Sample end time. */
  endDate: Date
  /** Number of steps recorded during the sample range. */
  count: number
}
