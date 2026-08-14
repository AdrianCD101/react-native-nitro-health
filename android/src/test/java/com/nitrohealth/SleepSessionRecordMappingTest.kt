package com.nitrohealth

import androidx.health.connect.client.records.SleepSessionRecord
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
        assertEquals(NativeHealthSampleIdentityKind.RECORD, envelope.identity.kind)
        assertEquals(record.metadata.id, envelope.identity.id)
        assertEquals(record.metadata.id, envelope.identity.recordId)
        assertEquals(sessionStart.toEpochMilli().toDouble(), envelope.startTimeMs, 0.0)
        assertEquals(sessionEnd.toEpochMilli().toDouble(), envelope.endTimeMs, 0.0)
        assertEquals(NativeSleepStageData.REPORTED, envelope.stageData)
        assertNull(envelope.stage)
        assertEquals(record.metadata.dataOrigin.packageName, envelope.origin.identifier)
        assertNull(envelope.origin.displayName)
        assertEquals(NativeHealthRecordingMethod.AUTOMATICALLYRECORDED, envelope.recordingMethod)

        val stage = samples[1]
        assertEquals(NativeSleepSampleKind.STAGE, stage.kind)
        assertEquals(NativeHealthSampleIdentityKind.RECORDCHILD, stage.identity.kind)
        assertEquals("${record.metadata.id}#0", stage.identity.id)
        assertEquals(record.metadata.id, stage.identity.recordId)
        assertEquals(stageStart.toEpochMilli().toDouble(), stage.startTimeMs, 0.0)
        assertEquals(stageEnd.toEpochMilli().toDouble(), stage.endTimeMs, 0.0)
        assertEquals("asleepCore", stage.stage)
        assertNull(stage.stageData)
        assertEquals(envelope.origin, stage.origin)
        assertEquals(envelope.recordingMethod, stage.recordingMethod)
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

    private fun makeRecord(
        stages: List<SleepSessionRecord.Stage>
    ): SleepSessionRecord {
        return SleepSessionRecord(
            startTime = sessionStart,
            startZoneOffset = null,
            endTime = sessionEnd,
            endZoneOffset = null,
            stages = stages,
            metadata = makeSampleMetadata(
                syncId = null,
                syncVersion = null,
                recordingMethod = NativeHealthRecordingMethod.AUTOMATICALLYRECORDED
            )
        )
    }
}
