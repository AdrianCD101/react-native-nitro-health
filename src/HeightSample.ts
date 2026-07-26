/** Height sample returned by {@linkcode NitroHealth.readHeight}. */
export interface HeightSample {
  /** Stable sample identifier: the HealthKit sample UUID on iOS, the Health Connect record id on Android. */
  uuid: string
  /** Instant the measurement was taken. */
  date: Date
  /** Height in meters. */
  meters: number
  /** Originating app or device, when available. */
  source?: string
}
