import type { NativeBloodPressureSample } from './NativeBloodPressureSample'

/** Native page of blood pressure samples returned through the Nitro spec. */
export interface NativeBloodPressureSamplePage {
  samples: NativeBloodPressureSample[]
  /** Opaque cursor for the next page; absent when no more data exists. */
  nextCursor?: string
}
