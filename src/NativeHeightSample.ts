/** Native height sample shape returned through the Nitro spec. */
export interface NativeHeightSample {
  /** Stable sample identifier (HealthKit UUID on iOS, Health Connect record id on Android). */
  uuid: string
  timeMs: number
  meters: number
  source?: string
}
