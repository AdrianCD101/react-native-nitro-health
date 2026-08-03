/** Native heart rate sample input shape passed through the Nitro spec. */
export interface NativeHeartRateSampleInput {
  timeMs: number
  bpm: number
  syncId?: string
  syncVersion?: number
}
