import type { NativeHealthWriteMetadata } from './NativeHealthWriteMetadata'

/** Native workout input using epoch-millisecond timestamps. */
export interface NativeWorkoutSampleInput {
  startTimeMs: number
  endTimeMs: number
  activityType: string
  displayName?: string
  timeZone?: string
  writeMetadata: NativeHealthWriteMetadata
}
