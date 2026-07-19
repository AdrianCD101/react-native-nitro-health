/** Body mass sample accepted by {@linkcode NitroHealth.saveBodyMass}. */
export interface BodyMassSampleInput {
  /** Instant the measurement was taken. */
  date: Date
  /** Body mass in kilograms (greater than 0, up to 1,000). */
  kilograms: number
}
