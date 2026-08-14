package com.nitrohealth

import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.records.metadata.Metadata
import com.margelo.nitro.nitrohealth.NativeHealthRecordingMethod
import java.time.Instant
import org.junit.Assert.assertArrayEquals
import org.junit.Assert.assertEquals
import org.junit.Test

class HealthRecordingMethodMappingTest {
    @Test
    fun mapsEveryHealthConnectRecordingMethodAndFallsBackForFutureValues() {
        val values = listOf(
            Metadata.RECORDING_METHOD_MANUAL_ENTRY to NativeHealthRecordingMethod.MANUAL,
            Metadata.RECORDING_METHOD_ACTIVELY_RECORDED to
                NativeHealthRecordingMethod.ACTIVELYRECORDED,
            Metadata.RECORDING_METHOD_AUTOMATICALLY_RECORDED to
                NativeHealthRecordingMethod.AUTOMATICALLYRECORDED,
            Metadata.RECORDING_METHOD_UNKNOWN to NativeHealthRecordingMethod.UNKNOWN
        )

        values.forEach { (healthConnect, native) ->
            assertEquals(native, nativeHealthRecordingMethod(healthConnect))
        }
        assertEquals(
            NativeHealthRecordingMethod.UNKNOWN,
            nativeHealthRecordingMethod(Int.MAX_VALUE)
        )
    }

    @Test
    fun writeResultPreservesConstructedRecordMetadataOrder() {
        val methods = arrayOf(
            NativeHealthRecordingMethod.AUTOMATICALLYRECORDED,
            NativeHealthRecordingMethod.MANUAL,
            NativeHealthRecordingMethod.UNKNOWN,
            NativeHealthRecordingMethod.ACTIVELYRECORDED
        )
        val time = Instant.parse("2026-01-01T00:00:00Z")
        val records = methods.map { method ->
            StepsRecord(
                startTime = time,
                startZoneOffset = null,
                endTime = time.plusSeconds(60),
                endZoneOffset = null,
                count = 1,
                metadata = makeSampleMetadata(null, null, method)
            )
        }

        val result = makeHealthWriteResult(records)

        assertArrayEquals(methods, result.storedRecordingMethods)
    }
}
