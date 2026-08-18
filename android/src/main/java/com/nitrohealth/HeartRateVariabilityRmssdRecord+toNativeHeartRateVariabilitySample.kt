package com.nitrohealth

import androidx.health.connect.client.records.HeartRateVariabilityRmssdRecord
import com.margelo.nitro.nitrohealth.NativeHeartRateVariabilitySample

internal fun makeNativeHeartRateVariabilitySample(
    record: HeartRateVariabilityRmssdRecord
): NativeHeartRateVariabilitySample {
    return NativeHeartRateVariabilitySample(
        sampleMetadata = makeNativeHealthSampleMetadata(record.metadata, record.zoneOffset),
        timeMs = record.time.toEpochMilli().toDouble(),
        milliseconds = record.heartRateVariabilityMillis,
        method = "rmssd"
    )
}
