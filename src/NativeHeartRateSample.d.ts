/** Native heart rate sample shape returned through the Nitro spec. */
export interface NativeHeartRateSample {
  timeMs: number
  bpm: number
  source?: string
}
