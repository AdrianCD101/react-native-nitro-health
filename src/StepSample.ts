/** Step count sample returned by {@linkcode NitroHealth.readSteps}. */
export interface StepSample {
  /** Stable sample identifier: the HealthKit sample UUID on iOS, the Health Connect record id on Android. */
  uuid: string
  /** Sample start time. */
  startDate: Date
  /** Sample end time. */
  endDate: Date
  /** Number of steps recorded during the sample range. */
  count: number
}
