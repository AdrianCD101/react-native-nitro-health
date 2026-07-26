/** Native distance interval with epoch millisecond timestamps. */
export interface NativeDistanceSample {
  /** Stable sample identifier (HealthKit UUID on iOS, Health Connect record id on Android). */
  uuid: string
  /** Inclusive start of the sample interval as Unix epoch milliseconds. */
  startTimeMs: number
  /** Exclusive end of the sample interval as Unix epoch milliseconds. */
  endTimeMs: number
  /** Distance traveled in meters. */
  distanceMeters: number
}
