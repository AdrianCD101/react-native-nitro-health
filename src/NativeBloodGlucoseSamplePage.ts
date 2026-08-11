import type { NativeBloodGlucoseSample } from './NativeBloodGlucoseSample'

/** Native page of blood glucose samples returned through the Nitro spec. */
export interface NativeBloodGlucoseSamplePage {
  samples: NativeBloodGlucoseSample[]
  /** Opaque cursor for the next page; absent when no more data exists. */
  nextCursor?: string
}
