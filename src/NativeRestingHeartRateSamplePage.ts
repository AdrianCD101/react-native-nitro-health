import type { NativeRestingHeartRateSample } from './NativeRestingHeartRateSample'

/** Native page of resting heart rate samples returned through the Nitro spec. */
export interface NativeRestingHeartRateSamplePage {
  samples: NativeRestingHeartRateSample[]
  /** Opaque cursor for the next page; absent when no more data exists. */
  nextCursor?: string
}
