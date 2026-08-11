import type { NativeBodyTemperatureSample } from './NativeBodyTemperatureSample'

/** Native page of body temperature samples returned through the Nitro spec. */
export interface NativeBodyTemperatureSamplePage {
  samples: NativeBodyTemperatureSample[]
  /** Opaque cursor for the next page; absent when no more data exists. */
  nextCursor?: string
}
