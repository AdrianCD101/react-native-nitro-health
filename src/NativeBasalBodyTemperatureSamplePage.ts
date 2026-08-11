import type { NativeBasalBodyTemperatureSample } from './NativeBasalBodyTemperatureSample'

/** Native page of basal body temperature samples returned through the Nitro spec. */
export interface NativeBasalBodyTemperatureSamplePage {
  samples: NativeBasalBodyTemperatureSample[]
  /** Opaque cursor for the next page; absent when no more data exists. */
  nextCursor?: string
}
