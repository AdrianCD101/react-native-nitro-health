/** Native workout input using epoch-millisecond timestamps. */
export interface NativeWorkoutSampleInput {
  startTimeMs: number
  endTimeMs: number
  activityType: string
  title?: string
  timeZone?: string
  syncId?: string
  syncVersion?: number
}
