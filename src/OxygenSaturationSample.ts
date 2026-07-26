/** Oxygen saturation sample returned by {@linkcode NitroHealth.readOxygenSaturation}. */
export interface OxygenSaturationSample {
  /** Stable sample identifier: the HealthKit sample UUID on iOS, the Health Connect record id on Android. */
  uuid: string
  /** Instant the reading was taken. */
  date: Date
  /** Oxygen saturation as a percentage (0-100), converted from HealthKit's 0-1 fraction on iOS. */
  percentage: number
  /** Originating app or device, when available. */
  source?: string
}
