/** Native workout session shape returned through the Nitro spec. */
export interface NativeWorkoutSample {
  startTimeMs: number
  endTimeMs: number
  durationSeconds: number
  activityType: string
  title?: string
  source?: string
  totalDistanceMeters?: number
  totalEnergyBurnedKcal?: number
}
