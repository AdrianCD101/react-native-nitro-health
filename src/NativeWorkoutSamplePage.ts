import type { NativeWorkoutSample } from './NativeWorkoutSample'

/** Native page of workout samples returned through the Nitro spec. */
export interface NativeWorkoutSamplePage {
  samples: NativeWorkoutSample[]
  /** Opaque cursor for the next page; absent when no more data exists. */
  nextCursor?: string
}
