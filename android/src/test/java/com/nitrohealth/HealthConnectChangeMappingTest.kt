package com.nitrohealth

import androidx.health.connect.client.changes.UpsertionChange
import androidx.health.connect.client.records.StepsRecord
import com.margelo.nitro.nitrohealth.NativeHealthRecordingMethod
import java.time.Instant
import org.junit.Assert.assertEquals
import org.junit.Test

class HealthConnectChangeMappingTest {
    @Test
    fun upsertionIncludesRecordRecordingMethod() {
        val startTime = Instant.parse("2026-01-01T00:00:00Z")
        val record = StepsRecord(
            startTime = startTime,
            startZoneOffset = null,
            endTime = startTime.plusSeconds(60),
            endZoneOffset = null,
            count = 10,
            metadata = makeSampleMetadata(
                syncId = null,
                syncVersion = null,
                recordingMethod = NativeHealthRecordingMethod.MANUAL
            )
        )

        val change = makeNativeHealthChange(UpsertionChange(record), "steps", StepsRecord::class)

        assertEquals(NativeHealthRecordingMethod.MANUAL, change.stepSamples!!.single().recordingMethod)
    }
}
