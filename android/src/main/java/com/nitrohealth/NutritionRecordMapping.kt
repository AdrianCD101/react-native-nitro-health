package com.nitrohealth

import androidx.health.connect.client.records.MealType
import androidx.health.connect.client.records.NutritionRecord
import com.margelo.nitro.nitrohealth.NativeNutritionMealType
import com.margelo.nitro.nitrohealth.NativeNutritionSample

internal fun healthConnectNutritionMealType(value: NativeNutritionMealType?): Int {
    return when (value) {
        null -> MealType.MEAL_TYPE_UNKNOWN
        NativeNutritionMealType.BREAKFAST -> MealType.MEAL_TYPE_BREAKFAST
        NativeNutritionMealType.LUNCH -> MealType.MEAL_TYPE_LUNCH
        NativeNutritionMealType.DINNER -> MealType.MEAL_TYPE_DINNER
        NativeNutritionMealType.SNACK -> MealType.MEAL_TYPE_SNACK
    }
}

internal fun nativeNutritionMealType(value: Int): NativeNutritionMealType? {
    return when (value) {
        MealType.MEAL_TYPE_UNKNOWN -> null
        MealType.MEAL_TYPE_BREAKFAST -> NativeNutritionMealType.BREAKFAST
        MealType.MEAL_TYPE_LUNCH -> NativeNutritionMealType.LUNCH
        MealType.MEAL_TYPE_DINNER -> NativeNutritionMealType.DINNER
        MealType.MEAL_TYPE_SNACK -> NativeNutritionMealType.SNACK
        else -> throw IllegalStateException(
            "Health Connect returned unsupported nutrition meal type: $value"
        )
    }
}

internal fun makeNativeNutritionSample(record: NutritionRecord): NativeNutritionSample {
    return NativeNutritionSample(
        sampleMetadata = makeNativeHealthSampleMetadata(record.metadata),
        startTimeMs = record.startTime.toEpochMilli().toDouble(),
        endTimeMs = record.endTime.toEpochMilli().toDouble(),
        foodName = record.name,
        mealType = nativeNutritionMealType(record.mealType),
        energyKilocalories = record.energy?.inKilocalories,
        proteinGrams = record.protein?.inGrams,
        totalCarbohydrateGrams = record.totalCarbohydrate?.inGrams,
        totalFatGrams = record.totalFat?.inGrams,
        dietaryFiberGrams = record.dietaryFiber?.inGrams,
        sugarGrams = record.sugar?.inGrams,
        sodiumMilligrams = record.sodium?.inMilligrams
    )
}
