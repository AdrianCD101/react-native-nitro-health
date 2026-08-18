package com.nitrohealth

import androidx.health.connect.client.records.BodyFatRecord
import com.margelo.nitro.nitrohealth.NativeBodyFatSample

internal fun makeNativeBodyFatSample(record: BodyFatRecord): NativeBodyFatSample {
    return NativeBodyFatSample(
        sampleMetadata = makeNativeHealthSampleMetadata(record.metadata, record.zoneOffset),
        timeMs = record.time.toEpochMilli().toDouble(),
        percentage = record.percentage.value
    )
}
