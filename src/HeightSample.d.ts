/** Height sample returned by {@linkcode NitroHealth.readHeight}. */
export interface HeightSample {
  /** Instant the measurement was taken. */
  date: Date
  /** Height in meters. */
  meters: number
  /** Originating app or device, when available. */
  source?: string
}
