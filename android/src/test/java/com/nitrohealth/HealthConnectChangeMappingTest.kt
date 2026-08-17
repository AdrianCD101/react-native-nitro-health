package com.nitrohealth

import androidx.health.connect.client.changes.UpsertionChange
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.records.metadata.Device
import androidx.health.connect.client.records.metadata.Metadata
import com.margelo.nitro.nitrohealth.NativeHealthDeviceType
import com.margelo.nitro.nitrohealth.NativeHealthRecordingMethod
import java.time.Instant
import org.junit.Assert.assertEquals
import org.junit.Test

class HealthConnectChangeMappingTest {
    @Test
    fun upsertionIncludesRecordRecordingMethodAndDevice() {
        val startTime = Instant.parse("2026-01-01T00:00:00Z")
        val record = StepsRecord(
            startTime = startTime,
            startZoneOffset = null,
            endTime = startTime.plusSeconds(60),
            endZoneOffset = null,
            count = 10,
            metadata = Metadata.autoRecorded(
                device = Device(
                    type = Device.TYPE_PHONE,
                    manufacturer = "Example Manufacturer",
                    model = "Example Model"
                )
            )
        )

        val change = makeNativeHealthChange(UpsertionChange(record), "steps", StepsRecord::class)

        val sample = change.stepSamples!!.single()
        assertEquals(
            NativeHealthRecordingMethod.AUTOMATICALLYRECORDED,
            sample.sampleMetadata.recordingMethod
        )
        assertEquals(NativeHealthDeviceType.PHONE, sample.sampleMetadata.deviceType)
        assertEquals("Example Manufacturer", sample.sampleMetadata.deviceManufacturer)
        assertEquals("Example Model", sample.sampleMetadata.deviceModel)
    }
}
