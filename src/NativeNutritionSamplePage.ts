import type { NativeNutritionSample } from './NativeNutritionSample'

/** Native page of nutrition samples returned through the Nitro spec. */
export interface NativeNutritionSamplePage {
  samples: NativeNutritionSample[]
  /** Opaque cursor for the next page; absent when no more data exists. */
  nextCursor?: string
}
