import type { HealthSample } from './HealthSample'
import type { NutritionMealType } from './NutritionMealType'

/**
 * Nutrition entry returned by {@linkcode NitroHealth.readNutrition}.
 *
 * One sample is one eating event. Android maps a Health Connect `NutritionRecord`
 * one-to-one; iOS unpacks the food `HKCorrelation` that groups the individual dietary
 * member samples, and `identity` is the correlation record. Dietary samples written by
 * other iOS apps outside a food correlation are not visible to this read.
 *
 * Water is never part of a nutrition entry; use {@linkcode NitroHealth.readHydration}.
 */
export interface NutritionSample extends HealthSample {
  /** Inclusive start of the eating event. */
  startDate: Date
  /** Exclusive end of the eating event. */
  endDate: Date
  /** Name or description of the food. */
  foodName?: string
  /** Meal associated with this entry. */
  mealType?: NutritionMealType
  /** Energy consumed in kilocalories. */
  energyKilocalories?: number
  /** Protein in grams. */
  proteinGrams?: number
  /** Total carbohydrate in grams. */
  totalCarbohydrateGrams?: number
  /** Total fat in grams. */
  totalFatGrams?: number
  /** Dietary fiber in grams. */
  dietaryFiberGrams?: number
  /** Sugar in grams. */
  sugarGrams?: number
  /** Sodium in milligrams. */
  sodiumMilligrams?: number
}
