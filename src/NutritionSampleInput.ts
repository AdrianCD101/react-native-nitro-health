import type { HealthDeviceInfo } from './HealthDeviceInfo'
import type { HealthRecordSync } from './HealthRecordSync'
import type { HealthRecordingMethod } from './HealthRecordingMethod'
import type { NutritionMealType } from './NutritionMealType'

/**
 * Nutrition entry accepted by {@linkcode NitroHealth.saveNutrition}.
 *
 * At least one nutrient field must be present. Water is never part of a nutrition
 * entry; use {@linkcode NitroHealth.saveHydration}.
 */
export interface NutritionSampleInput {
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
  /** Physical device asserted as having generated this sample. */
  device?: HealthDeviceInfo
  /**
   * Requested recording method. On iOS, active and automatic recording degrade to `unknown`.
   * @default 'unknown'
   */
  recordingMethod?: HealthRecordingMethod
  /** Optional logical identity that makes retries idempotent and higher versions replace. */
  sync?: HealthRecordSync
}
