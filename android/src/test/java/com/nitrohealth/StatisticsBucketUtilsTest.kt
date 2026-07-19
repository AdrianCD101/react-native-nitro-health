package com.nitrohealth

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
    fun statisticsDescriptorForStepsOnlySupportsSum() {
        val descriptor = statisticsDescriptorForDataType("steps")

        assertEquals(setOf("sum"), descriptor.metrics.keys)
    }

    @Test
    fun statisticsDescriptorForDistanceOnlySupportsSum() {
        val descriptor = statisticsDescriptorForDataType("distance")

        assertEquals(setOf("sum"), descriptor.metrics.keys)
    }

    @Test
    fun statisticsDescriptorForActiveEnergyBurnedOnlySupportsSum() {
        val descriptor = statisticsDescriptorForDataType("activeEnergyBurned")

        assertEquals(setOf("sum"), descriptor.metrics.keys)
    }

    @Test
    fun statisticsDescriptorForHeartRateSupportsAvgMinMax() {
        val descriptor = statisticsDescriptorForDataType("heartRate")

        assertEquals(setOf("avg", "min", "max"), descriptor.metrics.keys)
    }

    @Test
    fun statisticsDescriptorForBodyMassSupportsAvgMinMax() {
        val descriptor = statisticsDescriptorForDataType("bodyMass")

        assertEquals(setOf("avg", "min", "max"), descriptor.metrics.keys)
    }

    @Test(expected = IllegalArgumentException::class)
    fun statisticsDescriptorThrowsForSleep() {
        statisticsDescriptorForDataType("sleep")
    }

    @Test(expected = IllegalArgumentException::class)
    fun statisticsDescriptorThrowsForUnknownDataType() {
        statisticsDescriptorForDataType("unknown")
    }
}
