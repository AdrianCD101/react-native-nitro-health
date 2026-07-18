/** Native sleep interval shape returned through the Nitro spec. */
export interface NativeSleepSample {
  startTimeMs: number
  endTimeMs: number
  stage: string
  source?: string
}
