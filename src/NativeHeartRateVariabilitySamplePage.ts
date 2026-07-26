import type { NativeHeartRateVariabilitySample } from './NativeHeartRateVariabilitySample'

/** Native page of heart rate variability samples returned through the Nitro spec. */
export interface NativeHeartRateVariabilitySamplePage {
  samples: NativeHeartRateVariabilitySample[]
  /** Opaque cursor for the next page; absent when no more data exists. */
  nextCursor?: string
}
