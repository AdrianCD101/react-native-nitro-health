package com.nitrohealth

import androidx.health.connect.client.records.HeartRateRecord
import com.margelo.nitro.nitrohealth.NativeHeartRateSample

internal fun makeNativeHeartRateSamples(
    record: HeartRateRecord
): Array<NativeHeartRateSample> {
    val recordId = record.metadata.id
    return record.samples.mapIndexed { index, sample ->
        NativeHeartRateSample(
            sampleMetadata = makeNativeHealthSampleMetadata(
                record.metadata,
                record.startZoneOffset,
                makeRecordChildIdentity(recordId, index)
            ),
            timeMs = sample.time.toEpochMilli().toDouble(),
            bpm = sample.beatsPerMinute.toDouble()
        )
    }.toTypedArray()
}
