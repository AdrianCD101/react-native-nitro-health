package com.nitrohealth

import com.margelo.nitro.nitrohealth.NativeActiveEnergyBurnedSampleInput
import com.margelo.nitro.nitrohealth.NativeBodyMassSampleInput
import com.margelo.nitro.nitrohealth.NativeDistanceSampleInput
import com.margelo.nitro.nitrohealth.NativeHeartRateSampleInput
import com.margelo.nitro.nitrohealth.NativeHeightSampleInput
import com.margelo.nitro.nitrohealth.NativeOxygenSaturationSampleInput
import com.margelo.nitro.nitrohealth.NativeRestingHeartRateSampleInput
import com.margelo.nitro.nitrohealth.NativeStepSampleInput
import java.time.Instant
import org.junit.Assert.assertEquals
import org.junit.Test

class SampleInputConvertersTest {
    private val startTimeMs = 1_767_222_000_000.0
    private val endTimeMs = 1_767_223_800_000.0

    @Test
    fun toStepsRecordsMapsTimesAndCount() {
        val records = toStepsRecords(
            arrayOf(NativeStepSampleInput(startTimeMs, endTimeMs, 512.0))
        )

        assertEquals(1, records.size)
        assertEquals(Instant.ofEpochMilli(startTimeMs.toLong()), records[0].startTime)
        assertEquals(Instant.ofEpochMilli(endTimeMs.toLong()), records[0].endTime)
        assertEquals(512L, records[0].count)
    }

    @Test
    fun toDistanceRecordsMapsMeters() {
        val records = toDistanceRecords(
            arrayOf(NativeDistanceSampleInput(startTimeMs, endTimeMs, 1250.5))
        )

        assertEquals(1, records.size)
        assertEquals(1250.5, records[0].distance.inMeters, 0.0)
    }

    @Test
    fun toActiveCaloriesBurnedRecordsMapsKilocalories() {
        val records = toActiveCaloriesBurnedRecords(
            arrayOf(NativeActiveEnergyBurnedSampleInput(startTimeMs, endTimeMs, 215.25))
        )

        assertEquals(1, records.size)
        assertEquals(215.25, records[0].energy.inKilocalories, 0.0)
    }

    @Test
    fun toHeartRateRecordsCreatesOneSingleSampleRecordPerReading() {
        val secondTimeMs = startTimeMs + 60_000

        val records = toHeartRateRecords(
            arrayOf(
                NativeHeartRateSampleInput(startTimeMs, 72.0),
                NativeHeartRateSampleInput(secondTimeMs, 138.0)
            )
        )

        assertEquals(2, records.size)
        assertEquals(1, records[0].samples.size)
        assertEquals(Instant.ofEpochMilli(startTimeMs.toLong()), records[0].startTime)
        assertEquals(records[0].startTime, records[0].endTime)
        assertEquals(Instant.ofEpochMilli(startTimeMs.toLong()), records[0].samples[0].time)
        assertEquals(72L, records[0].samples[0].beatsPerMinute)
        assertEquals(138L, records[1].samples[0].beatsPerMinute)
    }

    @Test
    fun toHeartRateRecordsRoundsFractionalBpmToNearest() {
        val records = toHeartRateRecords(
            arrayOf(
                NativeHeartRateSampleInput(startTimeMs, 72.9),
                NativeHeartRateSampleInput(startTimeMs, 72.4)
            )
        )

        assertEquals(73L, records[0].samples[0].beatsPerMinute)
        assertEquals(72L, records[1].samples[0].beatsPerMinute)
    }

    @Test
    fun toWeightRecordsMapsPointInTimeKilograms() {
        val records = toWeightRecords(
            arrayOf(NativeBodyMassSampleInput(startTimeMs, 72.5))
        )

        assertEquals(1, records.size)
        assertEquals(Instant.ofEpochMilli(startTimeMs.toLong()), records[0].time)
        assertEquals(72.5, records[0].weight.inKilograms, 0.0)
    }

    @Test
    fun toRestingHeartRateRecordsMapsPointInTimeBpm() {
        val records = toRestingHeartRateRecords(
            arrayOf(NativeRestingHeartRateSampleInput(startTimeMs, 58.0))
        )

        assertEquals(1, records.size)
        assertEquals(Instant.ofEpochMilli(startTimeMs.toLong()), records[0].time)
        assertEquals(58L, records[0].beatsPerMinute)
    }

    @Test
    fun toRestingHeartRateRecordsRoundsFractionalBpmToNearest() {
        val records = toRestingHeartRateRecords(
            arrayOf(
                NativeRestingHeartRateSampleInput(startTimeMs, 58.9),
                NativeRestingHeartRateSampleInput(startTimeMs, 58.4)
            )
        )

        assertEquals(59L, records[0].beatsPerMinute)
        assertEquals(58L, records[1].beatsPerMinute)
    }

    @Test
    fun toOxygenSaturationRecordsMapsPointInTimePercentage() {
        val records = toOxygenSaturationRecords(
            arrayOf(NativeOxygenSaturationSampleInput(startTimeMs, 97.5))
        )

        assertEquals(1, records.size)
        assertEquals(Instant.ofEpochMilli(startTimeMs.toLong()), records[0].time)
        assertEquals(97.5, records[0].percentage.value, 0.0)
    }

    @Test
    fun toHeightRecordsMapsPointInTimeMeters() {
        val records = toHeightRecords(
            arrayOf(NativeHeightSampleInput(startTimeMs, 1.78))
        )

        assertEquals(1, records.size)
        assertEquals(Instant.ofEpochMilli(startTimeMs.toLong()), records[0].time)
        assertEquals(1.78, records[0].height.inMeters, 0.0)
    }
}
