/** Step count sample accepted by {@linkcode NitroHealth.saveSteps}. */
export interface StepSampleInput {
  /** Sample start time. */
  startDate: Date
  /** Sample end time. */
  endDate: Date
  /** Number of steps recorded during the sample range (1 to 1,000,000). */
  count: number
}
