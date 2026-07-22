/** Native heart rate variability sample shape returned through the Nitro spec. */
export interface NativeHeartRateVariabilitySample {
  timeMs: number
  milliseconds: number
  method: string
  source?: string
}
