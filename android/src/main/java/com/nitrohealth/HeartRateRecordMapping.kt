package com.nitrohealth

import androidx.health.connect.client.records.HeartRateRecord
import com.margelo.nitro.nitrohealth.NativeHeartRateSample

internal fun makeNativeHeartRateSamples(
    record: HeartRateRecord
): Array<NativeHeartRateSample> {
    val recordId = record.metadata.id
    val origin = makeHealthDataOrigin(record.metadata.dataOrigin.packageName)
    val recordingMethod = nativeHealthRecordingMethod(record.metadata.recordingMethod)
    return record.samples.mapIndexed { index, sample ->
        NativeHeartRateSample(
            identity = makeRecordChildIdentity(recordId, index),
            origin = origin,
            recordingMethod = recordingMethod,
            timeMs = sample.time.toEpochMilli().toDouble(),
            bpm = sample.beatsPerMinute.toDouble()
        )
    }.toTypedArray()
}
