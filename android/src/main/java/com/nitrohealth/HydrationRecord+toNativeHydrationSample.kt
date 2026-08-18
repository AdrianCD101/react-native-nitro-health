package com.nitrohealth

import androidx.health.connect.client.records.HydrationRecord
import com.margelo.nitro.nitrohealth.NativeHydrationSample

internal fun makeNativeHydrationSample(record: HydrationRecord): NativeHydrationSample {
    return NativeHydrationSample(
        sampleMetadata = makeNativeHealthSampleMetadata(record.metadata, record.startZoneOffset),
        startTimeMs = record.startTime.toEpochMilli().toDouble(),
        endTimeMs = record.endTime.toEpochMilli().toDouble(),
        milliliters = record.volume.inMilliliters
    )
}
