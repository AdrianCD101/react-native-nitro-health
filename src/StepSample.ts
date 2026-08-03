import type { HealthSampleIdentity } from './HealthSampleIdentity'

/** Step count sample returned by {@linkcode NitroHealth.readSteps}. */
export interface StepSample extends HealthSampleIdentity {
  /** Sample start time. */
  startDate: Date
  /** Sample end time. */
  endDate: Date
  /** Number of steps recorded during the sample range. */
  count: number
}
