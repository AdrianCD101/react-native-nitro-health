/** Native body mass sample shape returned through the Nitro spec. */
export interface NativeBodyMassSample {
  /** Stable sample identifier (HealthKit UUID on iOS, Health Connect record id on Android). */
  uuid: string
  startTimeMs: number
  endTimeMs: number
  kilograms: number
  source?: string
}
