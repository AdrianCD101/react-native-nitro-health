import type { NativeFloorsClimbedSample } from './NativeFloorsClimbedSample'

/** Native page of floors climbed samples returned through the Nitro spec. */
export interface NativeFloorsClimbedSamplePage {
  samples: NativeFloorsClimbedSample[]
  /** Opaque cursor for the next page; absent when no more data exists. */
  nextCursor?: string
}
