/** Sleep stages that can be written without losing meaning on either platform. */
export type WritableSleepStage = 'awake' | 'asleep' | 'asleepCore' | 'asleepDeep' | 'asleepREM'

/** One stage interval within a {@linkcode SleepSessionInput}. */
export interface SleepSessionStageInput {
  /** Start of the stage interval. */
  startDate: Date
  /** End of the stage interval. */
  endDate: Date
  /** Portable sleep stage recorded during the interval. */
  stage: WritableSleepStage
}
