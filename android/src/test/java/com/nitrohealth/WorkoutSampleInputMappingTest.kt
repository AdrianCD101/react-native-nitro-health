package com.nitrohealth

import androidx.health.connect.client.records.ExerciseSessionRecord
import androidx.health.connect.client.records.metadata.Device
import androidx.health.connect.client.records.metadata.Metadata
import com.margelo.nitro.nitrohealth.NativeHealthDeviceType
import com.margelo.nitro.nitrohealth.NativeHealthRecordingMethod
import com.margelo.nitro.nitrohealth.NativeWorkoutSampleInput
import java.time.Instant
import java.time.ZoneOffset
import org.junit.Assert.assertEquals
import org.junit.Assert.assertThrows
import org.junit.Test

class WorkoutSampleInputMappingTest {
    private val startTime = Instant.parse("2026-03-08T06:30:00Z")
    private val endTime = Instant.parse("2026-03-08T07:30:00Z")

    @Test
    fun mapsWorkoutFieldsMetadataAndDaylightSavingOffsets() {
        val record = toExerciseSessionRecord(
            NativeWorkoutSampleInput(
                startTimeMs = startTime.toEpochMilli().toDouble(),
                endTimeMs = endTime.toEpochMilli().toDouble(),
                activityType = "running",
                displayName = "Morning Run",
                timeZone = "America/New_York",
                writeMetadata = makeTestWriteMetadata(
                    deviceType = NativeHealthDeviceType.WATCH,
                    deviceManufacturer = "Example",
                    deviceModel = "Run Watch",
                    recordingMethod = NativeHealthRecordingMethod.ACTIVELYRECORDED,
                    syncId = "workout-1",
                    syncVersion = 2.0
                )
            )
        )

        assertEquals(startTime, record.startTime)
        assertEquals(endTime, record.endTime)
        assertEquals(ZoneOffset.of("-05:00"), record.startZoneOffset)
        assertEquals(ZoneOffset.of("-04:00"), record.endZoneOffset)
        assertEquals(ExerciseSessionRecord.EXERCISE_TYPE_RUNNING, record.exerciseType)
        assertEquals("Morning Run", record.title)
        assertEquals("workout-1", record.metadata.clientRecordId)
        assertEquals(2L, record.metadata.clientRecordVersion)
        assertEquals(Metadata.RECORDING_METHOD_ACTIVELY_RECORDED, record.metadata.recordingMethod)
        assertEquals(Device.TYPE_WATCH, record.metadata.device?.type)
        assertEquals("Example", record.metadata.device?.manufacturer)
        assertEquals("Run Watch", record.metadata.device?.model)
    }

    @Test
    fun rejectsInvalidNativeInputs() {
        assertThrows(IllegalArgumentException::class.java) {
            toExerciseSessionRecord(
                NativeWorkoutSampleInput(
                    startTimeMs = endTime.toEpochMilli().toDouble(),
                    endTimeMs = startTime.toEpochMilli().toDouble(),
                    activityType = "running",
                    displayName = null,
                    timeZone = "UTC",
                    writeMetadata = makeTestWriteMetadata()
                )
            )
        }
        assertThrows(IllegalArgumentException::class.java) {
            toExerciseSessionRecord(
                NativeWorkoutSampleInput(
                    startTimeMs = startTime.toEpochMilli().toDouble(),
                    endTimeMs = endTime.toEpochMilli().toDouble(),
                    activityType = "archery",
                    displayName = null,
                    timeZone = "UTC",
                    writeMetadata = makeTestWriteMetadata()
                )
            )
        }
    }
}
