import type { NativeDistanceSample } from './NativeDistanceSample'

/** Native page of distance samples returned through the Nitro spec. */
export interface NativeDistanceSamplePage {
  samples: NativeDistanceSample[]
  /** Opaque cursor for the next page; absent when no more data exists. */
  nextCursor?: string
}
