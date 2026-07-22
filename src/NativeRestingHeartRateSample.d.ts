/** Native resting heart rate sample shape returned through the Nitro spec. */
export interface NativeRestingHeartRateSample {
  timeMs: number
  bpm: number
  source?: string
}
