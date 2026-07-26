/** Native resting heart rate sample shape returned through the Nitro spec. */
export interface NativeRestingHeartRateSample {
  /** Stable sample identifier (HealthKit UUID on iOS, Health Connect record id on Android). */
  uuid: string
  timeMs: number
  bpm: number
  source?: string
}
