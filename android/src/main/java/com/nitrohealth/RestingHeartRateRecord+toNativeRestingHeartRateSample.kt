package com.nitrohealth

import androidx.health.connect.client.records.RestingHeartRateRecord
import com.margelo.nitro.nitrohealth.NativeRestingHeartRateSample

internal fun makeNativeRestingHeartRateSample(
    record: RestingHeartRateRecord
): NativeRestingHeartRateSample {
    return NativeRestingHeartRateSample(
        sampleMetadata = makeNativeHealthSampleMetadata(record.metadata),
        timeMs = record.time.toEpochMilli().toDouble(),
        bpm = record.beatsPerMinute.toDouble()
    )
}
