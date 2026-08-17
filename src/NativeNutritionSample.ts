import type { NativeHealthSampleMetadata } from './NativeHealthSampleMetadata'
import type { NativeNutritionMealType } from './NativeNutritionMealType'

/** Native nutrition entry with epoch millisecond timestamps. */
export interface NativeNutritionSample {
  sampleMetadata: NativeHealthSampleMetadata
  /** Inclusive start of the eating event as Unix epoch milliseconds. */
  startTimeMs: number
  /** Exclusive end of the eating event as Unix epoch milliseconds. */
  endTimeMs: number
  foodName?: string
  mealType?: NativeNutritionMealType
  energyKilocalories?: number
  proteinGrams?: number
  totalCarbohydrateGrams?: number
  totalFatGrams?: number
  dietaryFiberGrams?: number
  sugarGrams?: number
  sodiumMilligrams?: number
}
