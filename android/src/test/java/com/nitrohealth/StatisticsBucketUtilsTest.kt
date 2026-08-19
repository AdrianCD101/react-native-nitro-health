package com.nitrohealth

import androidx.health.connect.client.records.BasalMetabolicRateRecord
import androidx.health.connect.client.records.ExerciseSessionRecord
import androidx.health.connect.client.records.FloorsClimbedRecord
import androidx.health.connect.client.records.HydrationRecord
import androidx.health.connect.client.records.NutritionRecord
import androidx.health.connect.client.records.SleepSessionRecord
import androidx.health.connect.client.records.TotalCaloriesBurnedRecord
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import java.time.Duration
import java.time.Period

class StatisticsBucketUtilsTest {
    @Test
    fun makeBucketSlicerReturnsHourlyDurationForHour() {
        val slicer = makeBucketSlicer("hour")

        assertTrue(slicer is BucketSlicer.ByDuration)
        assertEquals(Duration.ofHours(1), (slicer as BucketSlicer.ByDuration).duration)
    }

    @Test
    fun makeBucketSlicerReturnsDailyPeriodForDay() {
        val slicer = makeBucketSlicer("day")

        assertTrue(slicer is BucketSlicer.ByPeriod)
        assertEquals(Period.ofDays(1), (slicer as BucketSlicer.ByPeriod).period)
    }

    @Test
    fun makeBucketSlicerReturnsWeeklyPeriodForWeek() {
        val slicer = makeBucketSlicer("week")

        assertTrue(slicer is BucketSlicer.ByPeriod)
        assertEquals(Period.ofWeeks(1), (slicer as BucketSlicer.ByPeriod).period)
    }

    @Test
    fun makeBucketSlicerReturnsMonthlyPeriodForMonth() {
        val slicer = makeBucketSlicer("month")

        assertTrue(slicer is BucketSlicer.ByPeriod)
        assertEquals(Period.ofMonths(1), (slicer as BucketSlicer.ByPeriod).period)
    }

    @Test
    fun makeBucketSlicerReturnsNullForUnknownBucket() {
        assertNull(makeBucketSlicer("year"))
    }

    @Test
    fun descriptorForStepsOnlySupportsSum() {
        val descriptor = healthDataTypeDescriptorFor("steps")

        assertEquals(setOf("sum"), descriptor.statisticsMetrics.keys)
    }

    @Test
    fun descriptorForDistanceOnlySupportsSum() {
        val descriptor = healthDataTypeDescriptorFor("distance")

        assertEquals(setOf("sum"), descriptor.statisticsMetrics.keys)
    }

    @Test
    fun descriptorForActiveEnergyBurnedOnlySupportsSum() {
        val descriptor = healthDataTypeDescriptorFor("activeEnergyBurned")

        assertEquals(setOf("sum"), descriptor.statisticsMetrics.keys)
    }

    @Test
    fun descriptorForHydrationOnlySupportsVolumeSum() {
        val descriptor = healthDataTypeDescriptorFor("hydration")

        assertEquals(HydrationRecord::class, descriptor.recordType)
        assertEquals(setOf("sum"), descriptor.statisticsMetrics.keys)
        assertEquals(
            HydrationRecord.VOLUME_TOTAL,
            descriptor.statisticsMetrics.getValue("sum").metric
        )
    }

    @Test
    fun descriptorForBasalEnergyBurnedAggregatesBasalCalories() {
        val descriptor = healthDataTypeDescriptorFor("basalEnergyBurned")

        assertEquals(BasalMetabolicRateRecord::class, descriptor.recordType)
        assertEquals(setOf("sum"), descriptor.statisticsMetrics.keys)
        assertEquals(
            BasalMetabolicRateRecord.BASAL_CALORIES_TOTAL,
            descriptor.statisticsMetrics.getValue("sum").metric
        )
    }

    @Test
    fun descriptorForTotalEnergyBurnedAggregatesEnergyTotal() {
        val descriptor = healthDataTypeDescriptorFor("totalEnergyBurned")

        assertEquals(TotalCaloriesBurnedRecord::class, descriptor.recordType)
        assertEquals(setOf("sum"), descriptor.statisticsMetrics.keys)
        assertEquals(
            TotalCaloriesBurnedRecord.ENERGY_TOTAL,
            descriptor.statisticsMetrics.getValue("sum").metric
        )
    }

    @Test
    fun descriptorsForNutritionStatisticsTypesAggregateTheirNutrientSums() {
        val expected = mapOf(
            "nutritionEnergyConsumed" to NutritionRecord.ENERGY_TOTAL,
            "nutritionProtein" to NutritionRecord.PROTEIN_TOTAL,
            "nutritionTotalCarbohydrate" to NutritionRecord.TOTAL_CARBOHYDRATE_TOTAL,
            "nutritionTotalFat" to NutritionRecord.TOTAL_FAT_TOTAL,
            "nutritionDietaryFiber" to NutritionRecord.DIETARY_FIBER_TOTAL,
            "nutritionSugar" to NutritionRecord.SUGAR_TOTAL,
            "nutritionSodium" to NutritionRecord.SODIUM_TOTAL
        )

        expected.forEach { (dataType, metric) ->
            val descriptor = healthDataTypeDescriptorFor(dataType)

            assertEquals(NutritionRecord::class, descriptor.recordType)
            assertEquals("nutrition", descriptor.permissionLabel)
            assertEquals(setOf("sum"), descriptor.statisticsMetrics.keys)
            assertEquals(metric, descriptor.statisticsMetrics.getValue("sum").metric)
        }
    }

    @Test
    fun descriptorForRawNutritionSupportsNoStatistics() {
        val descriptor = healthDataTypeDescriptorFor("nutrition")

        assertEquals(NutritionRecord::class, descriptor.recordType)
        assertEquals(emptySet<String>(), descriptor.statisticsMetrics.keys)
    }

    @Test
    fun descriptorForFloorsClimbedOnlySupportsSum() {
        val descriptor = healthDataTypeDescriptorFor("floorsClimbed")

        assertEquals(FloorsClimbedRecord::class, descriptor.recordType)
        assertEquals(setOf("sum"), descriptor.statisticsMetrics.keys)
        assertEquals(
            FloorsClimbedRecord.FLOORS_CLIMBED_TOTAL,
            descriptor.statisticsMetrics.getValue("sum").metric
        )
    }

    @Test
    fun descriptorForHeartRateSupportsAvgMinMax() {
        val descriptor = healthDataTypeDescriptorFor("heartRate")

        assertEquals(setOf("avg", "min", "max"), descriptor.statisticsMetrics.keys)
    }

    @Test
    fun descriptorForBodyMassSupportsAvgMinMax() {
        val descriptor = healthDataTypeDescriptorFor("bodyMass")

        assertEquals(setOf("avg", "min", "max"), descriptor.statisticsMetrics.keys)
    }

    @Test
    fun descriptorForRestingHeartRateSupportsAvgMinMax() {
        val descriptor = healthDataTypeDescriptorFor("restingHeartRate")

        assertEquals(setOf("avg", "min", "max"), descriptor.statisticsMetrics.keys)
    }

    @Test
    fun descriptorForHeightSupportsAvgMinMax() {
        val descriptor = healthDataTypeDescriptorFor("height")

        assertEquals(setOf("avg", "min", "max"), descriptor.statisticsMetrics.keys)
    }

    @Test
    fun descriptorForSleepAggregatesSleepDuration() {
        val descriptor = healthDataTypeDescriptorFor("sleep")

        assertEquals(setOf("duration"), descriptor.statisticsMetrics.keys)
        assertEquals(
            SleepSessionRecord.SLEEP_DURATION_TOTAL,
            descriptor.statisticsMetrics.getValue("duration").metric
        )
    }

    @Test
    fun descriptorForWorkoutAggregatesExerciseDuration() {
        val descriptor = healthDataTypeDescriptorFor("workout")

        assertEquals(setOf("duration"), descriptor.statisticsMetrics.keys)
        assertEquals(
            ExerciseSessionRecord.EXERCISE_DURATION_TOTAL,
            descriptor.statisticsMetrics.getValue("duration").metric
        )
    }

    // These data types exist in the descriptor table (permissions and raw reads need them) but
    // support no statistics metrics, so any requested metric fails the readStatistics lookup.
    @Test
    fun descriptorForHeartRateVariabilitySupportsNoStatisticsMetrics() {
        assertTrue(healthDataTypeDescriptorFor("heartRateVariability").statisticsMetrics.isEmpty())
    }

    @Test
    fun descriptorForOxygenSaturationSupportsNoStatisticsMetrics() {
        assertTrue(healthDataTypeDescriptorFor("oxygenSaturation").statisticsMetrics.isEmpty())
    }

    @Test
    fun descriptorForBloodPressureSupportsNoStatisticsMetrics() {
        assertTrue(healthDataTypeDescriptorFor("bloodPressure").statisticsMetrics.isEmpty())
    }

    @Test
    fun descriptorForBloodGlucoseSupportsNoStatisticsMetrics() {
        assertTrue(healthDataTypeDescriptorFor("bloodGlucose").statisticsMetrics.isEmpty())
    }

    @Test
    fun descriptorForBodyTemperatureSupportsNoStatisticsMetrics() {
        assertTrue(healthDataTypeDescriptorFor("bodyTemperature").statisticsMetrics.isEmpty())
    }

    @Test
    fun descriptorForRespiratoryRateSupportsNoStatisticsMetrics() {
        assertTrue(healthDataTypeDescriptorFor("respiratoryRate").statisticsMetrics.isEmpty())
    }

    @Test
    fun descriptorForVo2MaxSupportsNoStatisticsMetrics() {
        assertTrue(healthDataTypeDescriptorFor("vo2Max").statisticsMetrics.isEmpty())
    }

    @Test
    fun descriptorForBodyFatSupportsNoStatisticsMetrics() {
        assertTrue(healthDataTypeDescriptorFor("bodyFat").statisticsMetrics.isEmpty())
    }

    @Test
    fun descriptorForLeanBodyMassSupportsNoStatisticsMetrics() {
        assertTrue(healthDataTypeDescriptorFor("leanBodyMass").statisticsMetrics.isEmpty())
    }

    @Test
    fun descriptorForBasalBodyTemperatureSupportsNoStatisticsMetrics() {
        assertTrue(healthDataTypeDescriptorFor("basalBodyTemperature").statisticsMetrics.isEmpty())
    }

    @Test(expected = IllegalArgumentException::class)
    fun descriptorThrowsForUnknownDataType() {
        healthDataTypeDescriptorFor("unknown")
    }
}
