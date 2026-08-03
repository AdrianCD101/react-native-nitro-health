/** Native distance sample input shape passed through the Nitro spec. */
export interface NativeDistanceSampleInput {
  startTimeMs: number
  endTimeMs: number
  distanceMeters: number
  syncId?: string
  syncVersion?: number
}
