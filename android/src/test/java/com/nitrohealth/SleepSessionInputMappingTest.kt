package com.nitrohealth

import androidx.health.connect.client.records.SleepSessionRecord
import androidx.health.connect.client.records.metadata.Device
import androidx.health.connect.client.records.metadata.Metadata
import com.margelo.nitro.nitrohealth.NativeHealthDeviceType
import com.margelo.nitro.nitrohealth.NativeHealthRecordingMethod
import com.margelo.nitro.nitrohealth.NativeSleepSessionInput
import com.margelo.nitro.nitrohealth.NativeSleepSessionStageInput
import java.time.Instant
import java.time.ZoneOffset
import org.junit.Assert.assertEquals
import org.junit.Assert.assertThrows
import org.junit.Test

class SleepSessionInputMappingTest {
    private val startTime = Instant.parse("2026-01-11T03:00:00Z")
    private val endTime = Instant.parse("2026-01-11T11:30:00Z")

    @Test
    fun mapsSessionStagesTimeZoneAndMetadata() {
        val stageStart = Instant.parse("2026-01-11T04:00:00Z")
        val stageEnd = Instant.parse("2026-01-11T06:30:00Z")

        val record = toSleepSessionRecords(
            arrayOf(
                NativeSleepSessionInput(
                    startTimeMs = startTime.toEpochMilli().toDouble(),
                    endTimeMs = endTime.toEpochMilli().toDouble(),
                    stages = arrayOf(
                        NativeSleepSessionStageInput(
                            startTimeMs = stageStart.toEpochMilli().toDouble(),
                            endTimeMs = stageEnd.toEpochMilli().toDouble(),
                            stage = "asleepCore"
                        )
                    ),
                    writeMetadata = makeTestWriteMetadata(
                        deviceType = NativeHealthDeviceType.WATCH,
                        deviceManufacturer = "Example",
                        deviceModel = "Sleep Watch",
                        recordingMethod = NativeHealthRecordingMethod.AUTOMATICALLYRECORDED,
                        syncId = "night-2026-01-11",
                        syncVersion = 2.0,
                        timeZone = "America/New_York"
                    )
                )
            )
        ).single()

        assertEquals(startTime, record.startTime)
        assertEquals(endTime, record.endTime)
        assertEquals(ZoneOffset.of("-05:00"), record.startZoneOffset)
        assertEquals(ZoneOffset.of("-05:00"), record.endZoneOffset)
        assertEquals(
            Metadata.RECORDING_METHOD_AUTOMATICALLY_RECORDED,
            record.metadata.recordingMethod
        )
        assertEquals("night-2026-01-11", record.metadata.clientRecordId)
        assertEquals(2L, record.metadata.clientRecordVersion)
        assertEquals(Device.TYPE_WATCH, record.metadata.device?.type)
        assertEquals("Example", record.metadata.device?.manufacturer)
        assertEquals("Sleep Watch", record.metadata.device?.model)
        assertEquals(1, record.stages.size)
        assertEquals(stageStart, record.stages.single().startTime)
        assertEquals(stageEnd, record.stages.single().endTime)
        assertEquals(SleepSessionRecord.STAGE_TYPE_LIGHT, record.stages.single().stage)
    }

    @Test
    fun mapsEveryPortableStage() {
        assertEquals(SleepSessionRecord.STAGE_TYPE_AWAKE, toHealthConnectSleepStage("awake"))
        assertEquals(SleepSessionRecord.STAGE_TYPE_SLEEPING, toHealthConnectSleepStage("asleep"))
        assertEquals(SleepSessionRecord.STAGE_TYPE_LIGHT, toHealthConnectSleepStage("asleepCore"))
        assertEquals(SleepSessionRecord.STAGE_TYPE_DEEP, toHealthConnectSleepStage("asleepDeep"))
        assertEquals(SleepSessionRecord.STAGE_TYPE_REM, toHealthConnectSleepStage("asleepREM"))
    }

    @Test
    fun acceptsStageLessSessions() {
        val record = toSleepSessionRecords(
            arrayOf(
                NativeSleepSessionInput(
                    startTimeMs = startTime.toEpochMilli().toDouble(),
                    endTimeMs = endTime.toEpochMilli().toDouble(),
                    stages = emptyArray(),
                    writeMetadata = makeTestWriteMetadata(timeZone = "UTC")
                )
            )
        ).single()

        assertEquals(emptyList<SleepSessionRecord.Stage>(), record.stages)
        assertEquals(ZoneOffset.UTC, record.startZoneOffset)
        assertEquals(ZoneOffset.UTC, record.endZoneOffset)
    }

    @Test
    fun derivesOffsetsAcrossDaylightSavingTransition() {
        val dstStart = Instant.parse("2026-03-08T06:30:00Z")
        val dstEnd = Instant.parse("2026-03-08T07:30:00Z")
        val record = toSleepSessionRecords(
            arrayOf(
                NativeSleepSessionInput(
                    startTimeMs = dstStart.toEpochMilli().toDouble(),
                    endTimeMs = dstEnd.toEpochMilli().toDouble(),
                    stages = emptyArray(),
                    writeMetadata = makeTestWriteMetadata(timeZone = "America/New_York")
                )
            )
        ).single()

        assertEquals(ZoneOffset.of("-05:00"), record.startZoneOffset)
        assertEquals(ZoneOffset.of("-04:00"), record.endZoneOffset)
    }

    @Test
    fun rejectsInvalidTimeZoneAndStage() {
        assertThrows(IllegalArgumentException::class.java) {
            toSleepSessionRecords(
                arrayOf(
                    NativeSleepSessionInput(
                        startTimeMs = startTime.toEpochMilli().toDouble(),
                        endTimeMs = endTime.toEpochMilli().toDouble(),
                        stages = emptyArray(),
                        writeMetadata = makeTestWriteMetadata(timeZone = "Not/A_Zone")
                    )
                )
            )
        }

        assertThrows(IllegalArgumentException::class.java) {
            toHealthConnectSleepStage("outOfBed")
        }

        assertThrows(IllegalArgumentException::class.java) {
            toSleepSessionRecords(
                arrayOf(
                    NativeSleepSessionInput(
                        startTimeMs = startTime.toEpochMilli().toDouble(),
                        endTimeMs = endTime.toEpochMilli().toDouble(),
                        stages = emptyArray(),
                        writeMetadata = makeTestWriteMetadata(timeZone = "+01:00")
                    )
                )
            )
        }
    }
}
