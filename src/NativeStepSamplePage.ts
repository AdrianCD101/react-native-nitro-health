import type { NativeStepSample } from './NativeStepSample'

/** Native page of step samples returned through the Nitro spec. */
export interface NativeStepSamplePage {
  samples: NativeStepSample[]
  /** Opaque cursor for the next page; absent when no more data exists. */
  nextCursor?: string
}
