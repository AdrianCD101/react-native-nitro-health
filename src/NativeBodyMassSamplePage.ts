import type { NativeBodyMassSample } from './NativeBodyMassSample'

/** Native page of body mass samples returned through the Nitro spec. */
export interface NativeBodyMassSamplePage {
  samples: NativeBodyMassSample[]
  /** Opaque cursor for the next page; absent when no more data exists. */
  nextCursor?: string
}
