/** Native step sample shape returned through the Nitro spec. */
export interface NativeStepSample {
  /** Stable sample identifier (HealthKit UUID on iOS, Health Connect record id on Android). */
  uuid: string
  startTimeMs: number
  endTimeMs: number
  count: number
}
