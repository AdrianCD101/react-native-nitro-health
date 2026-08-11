import type { NativeRespiratoryRateSample } from './NativeRespiratoryRateSample'

/** Native page of respiratory rate samples returned through the Nitro spec. */
export interface NativeRespiratoryRateSamplePage {
  samples: NativeRespiratoryRateSample[]
  /** Opaque cursor for the next page; absent when no more data exists. */
  nextCursor?: string
}
