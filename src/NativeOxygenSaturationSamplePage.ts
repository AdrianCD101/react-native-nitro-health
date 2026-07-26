import type { NativeOxygenSaturationSample } from './NativeOxygenSaturationSample'

/** Native page of oxygen saturation samples returned through the Nitro spec. */
export interface NativeOxygenSaturationSamplePage {
  samples: NativeOxygenSaturationSample[]
  /** Opaque cursor for the next page; absent when no more data exists. */
  nextCursor?: string
}
