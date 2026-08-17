package com.nitrohealth

import androidx.health.connect.client.records.StepsRecord
import com.margelo.nitro.nitrohealth.NativeStepSample

internal fun makeNativeStepSample(record: StepsRecord): NativeStepSample {
    return NativeStepSample(
        sampleMetadata = makeNativeHealthSampleMetadata(record.metadata),
        startTimeMs = record.startTime.toEpochMilli().toDouble(),
        endTimeMs = record.endTime.toEpochMilli().toDouble(),
        count = record.count.toDouble()
    )
}
