/** Native workout session shape returned through the Nitro spec. */
export interface NativeWorkoutSample {
  /** Stable sample identifier (HealthKit UUID on iOS, Health Connect record id on Android). */
  uuid: string
  startTimeMs: number
  endTimeMs: number
  durationSeconds: number
  activityType: string
  title?: string
  source?: string
  totalDistanceMeters?: number
  totalEnergyBurnedKcal?: number
}
