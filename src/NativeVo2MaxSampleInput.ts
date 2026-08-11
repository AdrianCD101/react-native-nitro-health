/** Native VO2 max sample input shape passed through the Nitro spec. */
export interface NativeVo2MaxSampleInput {
  timeMs: number
  millilitersPerKilogramPerMinute: number
  syncId?: string
  syncVersion?: number
}
