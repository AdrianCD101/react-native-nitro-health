/** Step count sample returned by {@linkcode NitroHealth.readSteps}. */
export interface StepSample {
  /** Sample start time. */
  startDate: Date
  /** Sample end time. */
  endDate: Date
  /** Number of steps recorded during the sample range. */
  count: number
}
