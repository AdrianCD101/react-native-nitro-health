/** Native respiratory rate sample input shape passed through the Nitro spec. */
export interface NativeRespiratoryRateSampleInput {
  timeMs: number
  breathsPerMinute: number
  syncId?: string
  syncVersion?: number
}
