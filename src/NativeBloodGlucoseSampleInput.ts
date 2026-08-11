/** Native blood glucose sample input shape passed through the Nitro spec. */
export interface NativeBloodGlucoseSampleInput {
  timeMs: number
  millimolesPerLiter: number
  syncId?: string
  syncVersion?: number
}
