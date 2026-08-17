package com.nitrohealth

import androidx.health.connect.client.records.HeartRateRecord
import androidx.health.connect.client.records.metadata.Device
import androidx.health.connect.client.records.metadata.Metadata
import com.margelo.nitro.nitrohealth.NativeHealthDeviceType
import com.margelo.nitro.nitrohealth.NativeHealthRecordingMethod
import java.time.Instant
import org.junit.Assert.assertEquals
import org.junit.Test

class HeartRateRecordMappingTest {
    @Test
    fun childrenInheritParentRecordingMethodAndDevice() {
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
            metadata = Metadata.activelyRecorded(
                device = Device(
                    type = Device.TYPE_WATCH,
                    manufacturer = "Example Manufacturer",
                    model = "Example Model"
                )
            )
        )

        val samples = makeNativeHeartRateSamples(record)

        assertEquals(2, samples.size)
        samples.forEach {
            assertEquals(
                NativeHealthRecordingMethod.ACTIVELYRECORDED,
                it.sampleMetadata.recordingMethod
            )
            assertEquals(NativeHealthDeviceType.WATCH, it.sampleMetadata.deviceType)
            assertEquals("Example Manufacturer", it.sampleMetadata.deviceManufacturer)
            assertEquals("Example Model", it.sampleMetadata.deviceModel)
        }
    }
}
