package com.nitrohealth

import androidx.health.connect.client.records.ExerciseSessionRecord
import com.margelo.nitro.nitrohealth.NativeHealthMetricValue
import com.margelo.nitro.nitrohealth.NativeHealthMetricValueStatus
import com.margelo.nitro.nitrohealth.NativeWorkoutSample

internal fun makeNativeWorkoutSample(record: ExerciseSessionRecord): NativeWorkoutSample {
    val unsupportedMetric = NativeHealthMetricValue(
        status = NativeHealthMetricValueStatus.UNSUPPORTED,
        value = null
    )
    return NativeWorkoutSample(
        sampleMetadata = makeNativeHealthSampleMetadata(record.metadata),
        startTimeMs = record.startTime.toEpochMilli().toDouble(),
        endTimeMs = record.endTime.toEpochMilli().toDouble(),
        elapsedDurationSeconds =
            (record.endTime.toEpochMilli() - record.startTime.toEpochMilli()) / 1000.0,
        activeDuration = unsupportedMetric,
        activity = makeNativeWorkoutActivity(record.exerciseType),
        title = record.title,
        brandName = null,
        totalDistance = unsupportedMetric,
        totalActiveEnergyBurned = unsupportedMetric
    )
}
