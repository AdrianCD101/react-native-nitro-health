package com.nitrohealth

import androidx.health.connect.client.records.OxygenSaturationRecord
import com.margelo.nitro.nitrohealth.NativeOxygenSaturationSample

internal fun makeNativeOxygenSaturationSample(
    record: OxygenSaturationRecord
): NativeOxygenSaturationSample {
    return NativeOxygenSaturationSample(
        sampleMetadata = makeNativeHealthSampleMetadata(record.metadata),
        timeMs = record.time.toEpochMilli().toDouble(),
        percentage = record.percentage.value
    )
}
