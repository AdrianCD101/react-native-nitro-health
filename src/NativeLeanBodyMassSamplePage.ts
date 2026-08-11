import type { NativeLeanBodyMassSample } from './NativeLeanBodyMassSample'

/** Native page of lean body mass samples returned through the Nitro spec. */
export interface NativeLeanBodyMassSamplePage {
  samples: NativeLeanBodyMassSample[]
  /** Opaque cursor for the next page; absent when no more data exists. */
  nextCursor?: string
}
