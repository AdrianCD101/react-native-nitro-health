package com.nitrohealth

import androidx.health.connect.client.records.ExerciseSessionRecord
import com.margelo.nitro.nitrohealth.NativeHealthRecordingMethod
import com.margelo.nitro.nitrohealth.NativeHealthMetricValueStatus
import com.margelo.nitro.nitrohealth.NativeHealthSampleIdentityKind
import com.margelo.nitro.nitrohealth.NativeWorkoutActivityMapping
import com.margelo.nitro.nitrohealth.NativeWorkoutActivityPortability
import com.margelo.nitro.nitrohealth.NativeWorkoutActivityStatus
import java.time.Instant
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class ExerciseSessionRecordMappingTest {
    @Test
    fun mapsWorkoutIdentityOriginDurationsActivityAndUnsupportedMetrics() {
        val startTime = Instant.parse("2026-03-08T06:30:00Z")
        val endTime = Instant.parse("2026-03-08T07:30:00Z")
        val record = ExerciseSessionRecord(
            startTime = startTime,
            startZoneOffset = null,
            endTime = endTime,
            endZoneOffset = null,
            exerciseType = ExerciseSessionRecord.EXERCISE_TYPE_RUNNING_TREADMILL,
            title = "Morning Run",
            metadata = makeSampleMetadata(
                syncId = null,
                syncVersion = null,
                recordingMethod = NativeHealthRecordingMethod.MANUAL
            )
        )

        val sample = makeNativeWorkoutSample(record)

        assertEquals(NativeHealthSampleIdentityKind.RECORD, sample.identity.kind)
        assertEquals(record.metadata.id, sample.identity.id)
        assertEquals(record.metadata.id, sample.identity.recordId)
        assertEquals(record.metadata.dataOrigin.packageName, sample.origin.identifier)
        assertNull(sample.origin.displayName)
        assertEquals(NativeHealthRecordingMethod.MANUAL, sample.recordingMethod)
        assertEquals(3600.0, sample.elapsedDurationSeconds, 0.0)
        assertEquals(NativeHealthMetricValueStatus.UNSUPPORTED, sample.activeDuration.status)
        assertNull(sample.activeDuration.value)
        assertEquals(NativeWorkoutActivityStatus.KNOWN, sample.activity.status)
        assertEquals("running", sample.activity.type)
        assertEquals(NativeWorkoutActivityPortability.PORTABLE, sample.activity.portability)
        assertEquals(NativeWorkoutActivityMapping.BROADENED, sample.activity.mapping)
        assertEquals("Morning Run", sample.title)
        assertNull(sample.brandName)
        assertEquals(NativeHealthMetricValueStatus.UNSUPPORTED, sample.totalDistance.status)
        assertNull(sample.totalDistance.value)
        assertEquals(
            NativeHealthMetricValueStatus.UNSUPPORTED,
            sample.totalActiveEnergyBurned.status
        )
        assertNull(sample.totalActiveEnergyBurned.value)
    }
}
