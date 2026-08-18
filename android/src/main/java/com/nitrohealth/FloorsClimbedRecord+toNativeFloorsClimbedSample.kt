package com.nitrohealth

import androidx.health.connect.client.records.FloorsClimbedRecord
import com.margelo.nitro.nitrohealth.NativeFloorsClimbedSample

internal fun makeNativeFloorsClimbedSample(
    record: FloorsClimbedRecord
): NativeFloorsClimbedSample {
    return NativeFloorsClimbedSample(
        sampleMetadata = makeNativeHealthSampleMetadata(record.metadata, record.startZoneOffset),
        startTimeMs = record.startTime.toEpochMilli().toDouble(),
        endTimeMs = record.endTime.toEpochMilli().toDouble(),
        floors = record.floors
    )
}
