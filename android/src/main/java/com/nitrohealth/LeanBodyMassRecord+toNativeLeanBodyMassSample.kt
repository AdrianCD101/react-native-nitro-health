package com.nitrohealth

import androidx.health.connect.client.records.LeanBodyMassRecord
import com.margelo.nitro.nitrohealth.NativeLeanBodyMassSample

internal fun makeNativeLeanBodyMassSample(record: LeanBodyMassRecord): NativeLeanBodyMassSample {
    return NativeLeanBodyMassSample(
        sampleMetadata = makeNativeHealthSampleMetadata(record.metadata),
        timeMs = record.time.toEpochMilli().toDouble(),
        kilograms = record.mass.inKilograms
    )
}
