package com.nitrohealth

import androidx.health.connect.client.records.WeightRecord
import com.margelo.nitro.nitrohealth.NativeBodyMassSample

internal fun makeNativeBodyMassSample(record: WeightRecord): NativeBodyMassSample {
    val timeMs = record.time.toEpochMilli().toDouble()
    return NativeBodyMassSample(
        sampleMetadata = makeNativeHealthSampleMetadata(record.metadata, record.zoneOffset),
        startTimeMs = timeMs,
        endTimeMs = timeMs,
        kilograms = record.weight.inKilograms
    )
}
