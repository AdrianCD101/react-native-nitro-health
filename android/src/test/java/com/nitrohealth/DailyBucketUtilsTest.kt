package com.nitrohealth

import org.junit.Assert.assertEquals
import org.junit.Test

class DailyBucketUtilsTest {
    @Test
    fun clampDailyBucketRangeKeepsBucketInsideQuery() {
        val range = clampDailyBucketRange(
            bucketStartTimeMs = 10.0,
            bucketEndTimeMs = 20.0,
            queryStartTimeMs = 0.0,
            queryEndTimeMs = 30.0
        )

        assertEquals(10.0, range.startTimeMs, 0.0)
        assertEquals(20.0, range.endTimeMs, 0.0)
    }

    @Test
    fun clampDailyBucketRangeClampsStartToQueryStart() {
        val range = clampDailyBucketRange(
            bucketStartTimeMs = 0.0,
            bucketEndTimeMs = 20.0,
            queryStartTimeMs = 10.0,
            queryEndTimeMs = 30.0
        )

        assertEquals(10.0, range.startTimeMs, 0.0)
        assertEquals(20.0, range.endTimeMs, 0.0)
    }

    @Test
    fun clampDailyBucketRangeClampsEndToQueryEnd() {
        val range = clampDailyBucketRange(
            bucketStartTimeMs = 10.0,
            bucketEndTimeMs = 40.0,
            queryStartTimeMs = 0.0,
            queryEndTimeMs = 30.0
        )

        assertEquals(10.0, range.startTimeMs, 0.0)
        assertEquals(30.0, range.endTimeMs, 0.0)
    }

    @Test
    fun clampDailyBucketRangeClampsBothEdges() {
        val range = clampDailyBucketRange(
            bucketStartTimeMs = 0.0,
            bucketEndTimeMs = 40.0,
            queryStartTimeMs = 10.0,
            queryEndTimeMs = 30.0
        )

        assertEquals(10.0, range.startTimeMs, 0.0)
        assertEquals(30.0, range.endTimeMs, 0.0)
    }

    @Test
    fun clampDailyBucketRangeNeverInvertsWhenBucketFallsOutsideQuery() {
        val range = clampDailyBucketRange(
            bucketStartTimeMs = 0.0,
            bucketEndTimeMs = 5.0,
            queryStartTimeMs = 10.0,
            queryEndTimeMs = 30.0
        )

        assertEquals(10.0, range.startTimeMs, 0.0)
        assertEquals(10.0, range.endTimeMs, 0.0)
    }

    @Test
    fun clampDailyBucketRangeNeverExceedsQueryEndWhenBucketStartsAfterQuery() {
        val range = clampDailyBucketRange(
            bucketStartTimeMs = 40.0,
            bucketEndTimeMs = 50.0,
            queryStartTimeMs = 10.0,
            queryEndTimeMs = 30.0
        )

        assertEquals(30.0, range.startTimeMs, 0.0)
        assertEquals(30.0, range.endTimeMs, 0.0)
    }
}
