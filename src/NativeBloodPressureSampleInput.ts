/** Native blood pressure sample input shape passed through the Nitro spec. */
export interface NativeBloodPressureSampleInput {
  timeMs: number
  systolicMmHg: number
  diastolicMmHg: number
  syncId?: string
  syncVersion?: number
}
