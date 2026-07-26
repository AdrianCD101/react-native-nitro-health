import type { NativeHeightSample } from './NativeHeightSample'

/** Native page of height samples returned through the Nitro spec. */
export interface NativeHeightSamplePage {
  samples: NativeHeightSample[]
  /** Opaque cursor for the next page; absent when no more data exists. */
  nextCursor?: string
}
