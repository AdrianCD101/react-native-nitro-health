package com.nitrohealth

import androidx.health.connect.client.records.MealType
import androidx.health.connect.client.records.NutritionRecord
import androidx.health.connect.client.records.metadata.Metadata
import androidx.health.connect.client.units.Energy
import androidx.health.connect.client.units.Mass
import com.margelo.nitro.nitrohealth.NativeNutritionMealType
import java.time.Instant
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertThrows
import org.junit.Test

class NutritionRecordMappingTest {
    private val start = Instant.parse("2026-01-01T12:00:00Z")
    private val end = Instant.parse("2026-01-01T12:30:00Z")

    @Test
    fun mapsEveryMealTypeInBothDirections() {
        val values = listOf(
            NativeNutritionMealType.BREAKFAST to MealType.MEAL_TYPE_BREAKFAST,
            NativeNutritionMealType.LUNCH to MealType.MEAL_TYPE_LUNCH,
            NativeNutritionMealType.DINNER to MealType.MEAL_TYPE_DINNER,
            NativeNutritionMealType.SNACK to MealType.MEAL_TYPE_SNACK
        )

        values.forEach { (native, healthConnect) ->
            assertEquals(healthConnect, healthConnectNutritionMealType(native))
            assertEquals(native, nativeNutritionMealType(healthConnect))
        }
    }

    @Test
    fun mapsAbsentMealTypeToUnknownAndBack() {
        assertEquals(MealType.MEAL_TYPE_UNKNOWN, healthConnectNutritionMealType(null))
        assertNull(nativeNutritionMealType(MealType.MEAL_TYPE_UNKNOWN))
    }

    @Test
    fun throwsForUnsupportedMealTypeValues() {
        assertThrows(IllegalStateException::class.java) {
            nativeNutritionMealType(999)
        }
    }

    @Test
    fun mapsEveryNutrientFieldOntoNativeSample() {
        val record = NutritionRecord(
            startTime = start,
            startZoneOffset = null,
            endTime = end,
            endZoneOffset = null,
            energy = Energy.kilocalories(640.0),
            protein = Mass.grams(42.0),
            totalCarbohydrate = Mass.grams(38.5),
            totalFat = Mass.grams(22.0),
            dietaryFiber = Mass.grams(6.0),
            sugar = Mass.grams(9.5),
            sodium = Mass.milligrams(820.0),
            name = "Chicken salad",
            mealType = MealType.MEAL_TYPE_LUNCH,
            metadata = Metadata.unknownRecordingMethod()
        )

        val sample = makeNativeNutritionSample(record)

        assertEquals(start.toEpochMilli().toDouble(), sample.startTimeMs, 0.0)
        assertEquals(end.toEpochMilli().toDouble(), sample.endTimeMs, 0.0)
        assertEquals("Chicken salad", sample.foodName)
        assertEquals(NativeNutritionMealType.LUNCH, sample.mealType)
        assertEquals(640.0, sample.energyKilocalories!!, 0.0001)
        assertEquals(42.0, sample.proteinGrams!!, 0.0001)
        assertEquals(38.5, sample.totalCarbohydrateGrams!!, 0.0001)
        assertEquals(22.0, sample.totalFatGrams!!, 0.0001)
        assertEquals(6.0, sample.dietaryFiberGrams!!, 0.0001)
        assertEquals(9.5, sample.sugarGrams!!, 0.0001)
        assertEquals(820.0, sample.sodiumMilligrams!!, 0.0001)
    }

    @Test
    fun mapsAbsentNutrientsToNullInsteadOfZero() {
        val record = NutritionRecord(
            startTime = start,
            startZoneOffset = null,
            endTime = end,
            endZoneOffset = null,
            protein = Mass.grams(30.0),
            metadata = Metadata.unknownRecordingMethod()
        )

        val sample = makeNativeNutritionSample(record)

        assertEquals(30.0, sample.proteinGrams!!, 0.0001)
        assertNull(sample.energyKilocalories)
        assertNull(sample.totalCarbohydrateGrams)
        assertNull(sample.totalFatGrams)
        assertNull(sample.dietaryFiberGrams)
        assertNull(sample.sugarGrams)
        assertNull(sample.sodiumMilligrams)
        assertNull(sample.foodName)
        assertNull(sample.mealType)
    }
}
