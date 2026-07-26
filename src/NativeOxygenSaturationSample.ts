/** Native oxygen saturation sample shape returned through the Nitro spec. */
export interface NativeOxygenSaturationSample {
  /** Stable sample identifier (HealthKit UUID on iOS, Health Connect record id on Android). */
  uuid: string
  timeMs: number
  percentage: number
  source?: string
}
