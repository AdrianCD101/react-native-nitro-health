package com.nitrohealth

import androidx.health.connect.client.records.ActiveCaloriesBurnedRecord
import com.margelo.nitro.nitrohealth.NativeActiveEnergyBurnedSample

internal fun makeNativeActiveEnergyBurnedSample(
    record: ActiveCaloriesBurnedRecord
): NativeActiveEnergyBurnedSample {
    return NativeActiveEnergyBurnedSample(
        sampleMetadata = makeNativeHealthSampleMetadata(record.metadata, record.startZoneOffset),
        startTimeMs = record.startTime.toEpochMilli().toDouble(),
        endTimeMs = record.endTime.toEpochMilli().toDouble(),
        kilocalories = record.energy.inKilocalories
    )
}
