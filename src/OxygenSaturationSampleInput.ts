/** Oxygen saturation sample accepted by {@linkcode NitroHealth.saveOxygenSaturation}. */
export interface OxygenSaturationSampleInput {
  /** Instant the reading was taken. */
  date: Date
  /**
   * Oxygen saturation as a percentage. Must be between 0 and 100 inclusive. iOS stores this
   * as HealthKit's 0-1 fraction (divided by 100 before saving); Android stores it directly.
   */
  percentage: number
}
