package com.nitrohealth

import androidx.health.connect.client.records.HeartRateRecord
import com.margelo.nitro.nitrohealth.NativeHealthRecordingMethod
import java.time.Instant
import org.junit.Assert.assertEquals
import org.junit.Test

class HeartRateRecordMappingTest {
    @Test
    fun childrenInheritParentRecordingMethod() {
        val startTime = Instant.parse("2026-01-01T00:00:00Z")
        val record = HeartRateRecord(
            startTime = startTime,
            startZoneOffset = null,
            endTime = startTime.plusSeconds(60),
            endZoneOffset = null,
            samples = listOf(
                HeartRateRecord.Sample(startTime, 60),
                HeartRateRecord.Sample(startTime.plusSeconds(60), 80)
            ),
            metadata = makeSampleMetadata(
                syncId = null,
                syncVersion = null,
                recordingMethod = NativeHealthRecordingMethod.ACTIVELYRECORDED
            )
        )

        val samples = makeNativeHeartRateSamples(record)

        assertEquals(2, samples.size)
        samples.forEach {
            assertEquals(NativeHealthRecordingMethod.ACTIVELYRECORDED, it.recordingMethod)
        }
    }
}
