import type { NativeHeartRateSample } from './NativeHeartRateSample'

/** Native page of heart rate samples returned through the Nitro spec. */
export interface NativeHeartRateSamplePage {
  samples: NativeHeartRateSample[]
  /** Opaque cursor for the next page; absent when no more data exists. */
  nextCursor?: string
}
