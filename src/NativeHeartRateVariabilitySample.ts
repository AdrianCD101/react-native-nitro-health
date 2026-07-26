/** Native heart rate variability sample shape returned through the Nitro spec. */
export interface NativeHeartRateVariabilitySample {
  /** Stable sample identifier (HealthKit UUID on iOS, Health Connect record id on Android). */
  uuid: string
  timeMs: number
  milliseconds: number
  method: string
  source?: string
}
