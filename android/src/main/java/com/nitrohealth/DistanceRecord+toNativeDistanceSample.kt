package com.nitrohealth

import androidx.health.connect.client.records.DistanceRecord
import com.margelo.nitro.nitrohealth.NativeDistanceSample
import com.margelo.nitro.nitrohealth.NativeDistanceScope

internal fun makeNativeDistanceSample(record: DistanceRecord): NativeDistanceSample {
    return NativeDistanceSample(
        sampleMetadata = makeNativeHealthSampleMetadata(record.metadata, record.startZoneOffset),
        startTimeMs = record.startTime.toEpochMilli().toDouble(),
        endTimeMs = record.endTime.toEpochMilli().toDouble(),
        distanceMeters = record.distance.inMeters,
        scope = NativeDistanceScope.ACTIVITYUNSPECIFIED
    )
}
