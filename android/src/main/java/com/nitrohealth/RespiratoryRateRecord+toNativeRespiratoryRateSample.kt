package com.nitrohealth

import androidx.health.connect.client.records.RespiratoryRateRecord
import com.margelo.nitro.nitrohealth.NativeRespiratoryRateSample

internal fun makeNativeRespiratoryRateSample(
    record: RespiratoryRateRecord
): NativeRespiratoryRateSample {
    return NativeRespiratoryRateSample(
        sampleMetadata = makeNativeHealthSampleMetadata(record.metadata),
        timeMs = record.time.toEpochMilli().toDouble(),
        breathsPerMinute = record.rate
    )
}
