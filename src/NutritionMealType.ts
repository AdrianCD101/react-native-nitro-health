/**
 * Meal associated with a nutrition entry.
 *
 * Health Connect stores this natively on `NutritionRecord.mealType`. HealthKit has no
 * standard meal-type key, so iOS retains it under the library-owned correlation metadata
 * key `com.nitrohealth.meal_type` — round-tripped by this library, semantically opaque to
 * other HealthKit apps.
 */
export type NutritionMealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'
