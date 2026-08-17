import type { NativeHealthWriteMetadata } from './NativeHealthWriteMetadata'
import type { NativeNutritionMealType } from './NativeNutritionMealType'

/** Native nutrition entry input shape passed through the Nitro spec. */
export interface NativeNutritionSampleInput {
  startTimeMs: number
  endTimeMs: number
  writeMetadata: NativeHealthWriteMetadata
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
