package com.nitrohealth

import androidx.health.connect.client.records.SleepSessionRecord
import androidx.health.connect.client.records.metadata.Device
import androidx.health.connect.client.records.metadata.Metadata
import com.margelo.nitro.nitrohealth.NativeHealthDeviceType
import com.margelo.nitro.nitrohealth.NativeHealthRecordingMethod
import com.margelo.nitro.nitrohealth.NativeHealthSampleIdentityKind
import com.margelo.nitro.nitrohealth.NativeSleepSampleKind
import com.margelo.nitro.nitrohealth.NativeSleepStageData
import java.time.Instant
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class SleepSessionRecordMappingTest {
    private val sessionStart = Instant.parse("2026-01-11T03:00:00Z")
    private val sessionEnd = Instant.parse("2026-01-11T11:30:00Z")

    @Test
    fun emitsEnvelopeBeforeExplicitStageChildren() {
        val stageStart = Instant.parse("2026-01-11T04:00:00Z")
        val stageEnd = Instant.parse("2026-01-11T06:30:00Z")
        val record = makeRecord(
            stages = listOf(
                SleepSessionRecord.Stage(
                    startTime = stageStart,
                    endTime = stageEnd,
                    stage = SleepSessionRecord.STAGE_TYPE_LIGHT
                )
            )
        )

        val samples = makeNativeSleepSamples(record)

        assertEquals(2, samples.size)
        val envelope = samples[0]
        assertEquals(NativeSleepSampleKind.SESSIONENVELOPE, envelope.kind)
        assertEquals(NativeHealthSampleIdentityKind.RECORD, envelope.sampleMetadata.identityKind)
        assertEquals(record.metadata.id, envelope.sampleMetadata.identityId)
        assertEquals(record.metadata.id, envelope.sampleMetadata.identityRecordId)
        assertEquals(sessionStart.toEpochMilli().toDouble(), envelope.startTimeMs, 0.0)
        assertEquals(sessionEnd.toEpochMilli().toDouble(), envelope.endTimeMs, 0.0)
        assertEquals(NativeSleepStageData.REPORTED, envelope.stageData)
        assertNull(envelope.stage)
        assertEquals("Night sleep", envelope.androidTitle)
        assertEquals("travel day", envelope.androidNotes)
        assertEquals(record.metadata.dataOrigin.packageName, envelope.sampleMetadata.originIdentifier)
        assertNull(envelope.sampleMetadata.originDisplayName)
        assertEquals(
            NativeHealthRecordingMethod.AUTOMATICALLYRECORDED,
            envelope.sampleMetadata.recordingMethod
        )

        val stage = samples[1]
        assertEquals(NativeSleepSampleKind.STAGE, stage.kind)
        assertEquals(NativeHealthSampleIdentityKind.RECORDCHILD, stage.sampleMetadata.identityKind)
        assertEquals("${record.metadata.id}#0", stage.sampleMetadata.identityId)
        assertEquals(record.metadata.id, stage.sampleMetadata.identityRecordId)
        assertEquals(stageStart.toEpochMilli().toDouble(), stage.startTimeMs, 0.0)
        assertEquals(stageEnd.toEpochMilli().toDouble(), stage.endTimeMs, 0.0)
        assertEquals("asleepCore", stage.stage)
        assertNull(stage.stageData)
        assertNull(stage.androidTitle)
        assertNull(stage.androidNotes)
        assertEquals(
            envelope.sampleMetadata.originIdentifier,
            stage.sampleMetadata.originIdentifier
        )
        assertEquals(envelope.sampleMetadata.deviceType, stage.sampleMetadata.deviceType)
        assertEquals(NativeHealthDeviceType.RING, stage.sampleMetadata.deviceType)
        assertEquals("Example Manufacturer", stage.sampleMetadata.deviceManufacturer)
        assertEquals("Example Model", stage.sampleMetadata.deviceModel)
        assertEquals(
            envelope.sampleMetadata.recordingMethod,
            stage.sampleMetadata.recordingMethod
        )
    }

    @Test
    fun stageLessSessionEmitsOnlyNotReportedEnvelope() {
        val record = makeRecord(stages = emptyList())

        val samples = makeNativeSleepSamples(record)

        assertEquals(1, samples.size)
        assertEquals(NativeSleepSampleKind.SESSIONENVELOPE, samples[0].kind)
        assertEquals(NativeSleepStageData.NOTREPORTED, samples[0].stageData)
        assertNull(samples[0].stage)
    }

    @Test
    fun envelopeAndChildrenOmitUnknownOnlyDevice() {
        val stageStart = Instant.parse("2026-01-11T04:00:00Z")
        val stageEnd = Instant.parse("2026-01-11T06:30:00Z")
        val record = makeRecord(
            stages = listOf(
                SleepSessionRecord.Stage(
                    startTime = stageStart,
                    endTime = stageEnd,
                    stage = SleepSessionRecord.STAGE_TYPE_LIGHT
                )
            ),
            device = Device(type = Device.TYPE_UNKNOWN)
        )

        makeNativeSleepSamples(record).forEach {
            assertNull(it.sampleMetadata.deviceType)
            assertNull(it.sampleMetadata.deviceManufacturer)
            assertNull(it.sampleMetadata.deviceModel)
        }
    }

    private fun makeRecord(
        stages: List<SleepSessionRecord.Stage>,
        device: Device = Device(
            type = Device.TYPE_RING,
            manufacturer = "Example Manufacturer",
            model = "Example Model"
        )
    ): SleepSessionRecord {
        return SleepSessionRecord(
            startTime = sessionStart,
            startZoneOffset = null,
            endTime = sessionEnd,
            endZoneOffset = null,
            title = "Night sleep",
            notes = "travel day",
            stages = stages,
            metadata = Metadata.autoRecorded(device = device)
        )
    }
}
