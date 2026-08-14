package com.nitrohealth

import androidx.health.connect.client.records.ExerciseSessionRecord
import com.margelo.nitro.nitrohealth.NativeWorkoutSampleInput
import java.time.Instant

internal fun toExerciseSessionRecord(workout: NativeWorkoutSampleInput): ExerciseSessionRecord {
    val startTime = Instant.ofEpochMilli(workout.startTimeMs.toLong())
    val endTime = Instant.ofEpochMilli(workout.endTimeMs.toLong())
    require(startTime < endTime) { "workout: startDate must be before endDate" }
    require(workout.displayName == null || workout.displayName.isNotBlank()) {
        "workout: displayName must be a non-empty string when provided"
    }

    val zoneId = resolveIanaZoneId(workout.timeZone, "workout")
    return ExerciseSessionRecord(
        startTime = startTime,
        startZoneOffset = zoneId.rules.getOffset(startTime),
        endTime = endTime,
        endZoneOffset = zoneId.rules.getOffset(endTime),
        exerciseType = toHealthConnectWorkoutActivityType(workout.activityType),
        title = workout.displayName,
        metadata = makeSampleMetadata(workout.syncId, workout.syncVersion, workout.recordingMethod)
    )
}
