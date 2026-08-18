package com.nitrohealth

import androidx.health.connect.client.records.HeightRecord
import com.margelo.nitro.nitrohealth.NativeHeightSample

internal fun makeNativeHeightSample(record: HeightRecord): NativeHeightSample {
    return NativeHeightSample(
        sampleMetadata = makeNativeHealthSampleMetadata(record.metadata, record.zoneOffset),
        timeMs = record.time.toEpochMilli().toDouble(),
        meters = record.height.inMeters
    )
}
