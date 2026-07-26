/** Body mass sample returned by {@linkcode NitroHealth.readBodyMass}. */
export interface BodyMassSample {
  /** Stable sample identifier: the HealthKit sample UUID on iOS, the Health Connect record id on Android. */
  uuid: string
  /** Start of the body mass sample interval. */
  startDate: Date
  /** End of the body mass sample interval. */
  endDate: Date
  /** Body mass in kilograms. */
  kilograms: number
  /** Originating app or device, when available. */
  source?: string
}
