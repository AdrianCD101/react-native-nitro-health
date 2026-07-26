import type { NativeSleepSample } from './NativeSleepSample'

/** Native page of sleep samples returned through the Nitro spec. */
export interface NativeSleepSamplePage {
  samples: NativeSleepSample[]
  /** Opaque cursor for the next page; absent when no more data exists. */
  nextCursor?: string
}
