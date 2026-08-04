/** Native sleep stage input using epoch-millisecond timestamps. */
export interface NativeSleepSessionStageInput {
  startTimeMs: number
  endTimeMs: number
  stage: string
}
