import type { NativeHydrationSample } from './NativeHydrationSample'

/** Native page of hydration samples returned through the Nitro spec. */
export interface NativeHydrationSamplePage {
  samples: NativeHydrationSample[]
  /** Opaque cursor for the next page; absent when no more data exists. */
  nextCursor?: string
}
