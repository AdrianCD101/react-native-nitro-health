import type { NativeBodyFatSample } from './NativeBodyFatSample'

/** Native page of body fat samples returned through the Nitro spec. */
export interface NativeBodyFatSamplePage {
  samples: NativeBodyFatSample[]
  /** Opaque cursor for the next page; absent when no more data exists. */
  nextCursor?: string
}
