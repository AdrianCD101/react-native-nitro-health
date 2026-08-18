import type { HealthWriteMetadataInput } from './HealthWriteMetadataInput'
import type { NutritionMealType } from './NutritionMealType'

/**
 * Nutrition entry accepted by {@linkcode NitroHealth.saveNutrition}.
 *
 * At least one nutrient field must be present. Water is never part of a nutrition
 * entry; use {@linkcode NitroHealth.saveHydration}.
 */
export interface NutritionSampleInput extends HealthWriteMetadataInput {
  /** Inclusive start of the eating event. */
  startDate: Date
  /** Exclusive end of the eating event. */
  endDate: Date
  /** Name or description of the food. */
  foodName?: string
  /** Meal associated with this entry. */
  mealType?: NutritionMealType
  /** Energy consumed in kilocalories (0 to 100,000). */
  energyKilocalories?: number
  /** Protein in grams (0 to 100,000). */
  proteinGrams?: number
  /** Total carbohydrate in grams (0 to 100,000). */
  totalCarbohydrateGrams?: number
  /** Total fat in grams (0 to 100,000). */
  totalFatGrams?: number
  /** Dietary fiber in grams (0 to 100,000). */
  dietaryFiberGrams?: number
  /** Sugar in grams (0 to 100,000). */
  sugarGrams?: number
  /** Sodium in milligrams (0 to 100,000). */
  sodiumMilligrams?: number
}
