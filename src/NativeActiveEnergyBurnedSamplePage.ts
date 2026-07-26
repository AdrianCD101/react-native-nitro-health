import type { NativeActiveEnergyBurnedSample } from './NativeActiveEnergyBurnedSample'

/** Native page of active-energy samples returned through the Nitro spec. */
export interface NativeActiveEnergyBurnedSamplePage {
  samples: NativeActiveEnergyBurnedSample[]
  /** Opaque cursor for the next page; absent when no more data exists. */
  nextCursor?: string
}
