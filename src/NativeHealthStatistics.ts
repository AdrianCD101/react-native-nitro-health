/** Native statistics bucket shape returned through the Nitro spec. */
export interface NativeHealthStatistics {
  startTimeMs: number
  endTimeMs: number
  sum?: number
  avg?: number
  min?: number
  max?: number
}
