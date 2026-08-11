import type { NativeVo2MaxSample } from './NativeVo2MaxSample'

/** Native page of VO2 max samples returned through the Nitro spec. */
export interface NativeVo2MaxSamplePage {
  samples: NativeVo2MaxSample[]
  /** Opaque cursor for the next page; absent when no more data exists. */
  nextCursor?: string
}
