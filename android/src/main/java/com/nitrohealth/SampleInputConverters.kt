package com.nitrohealth

import androidx.health.connect.client.records.ActiveCaloriesBurnedRecord
import androidx.health.connect.client.records.DistanceRecord
import androidx.health.connect.client.records.HeartRateRecord
import androidx.health.connect.client.records.HeightRecord
import androidx.health.connect.client.records.OxygenSaturationRecord
import androidx.health.connect.client.records.RestingHeartRateRecord
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.records.WeightRecord
import androidx.health.connect.client.units.Energy
import androidx.health.connect.client.units.Length
import androidx.health.connect.client.units.Mass
import androidx.health.connect.client.units.Percentage
import com.margelo.nitro.nitrohealth.NativeActiveEnergyBurnedSampleInput
import com.margelo.nitro.nitrohealth.NativeBodyMassSampleInput
import com.margelo.nitro.nitrohealth.NativeDistanceSampleInput
import com.margelo.nitro.nitrohealth.NativeHeartRateSampleInput
import com.margelo.nitro.nitrohealth.NativeHeightSampleInput
import com.margelo.nitro.nitrohealth.NativeOxygenSaturationSampleInput
import com.margelo.nitro.nitrohealth.NativeRestingHeartRateSampleInput
import com.margelo.nitro.nitrohealth.NativeStepSampleInput
import java.time.Instant
import kotlin.math.roundToLong

internal fun toStepsRecords(samples: Array<NativeStepSampleInput>): List<StepsRecord> {
    return samples.map { sample ->
        StepsRecord(
            startTime = Instant.ofEpochMilli(sample.startTimeMs.toLong()),
            startZoneOffset = null,
            endTime = Instant.ofEpochMilli(sample.endTimeMs.toLong()),
            endZoneOffset = null,
            count = sample.count.toLong(),
            metadata = makeSampleMetadata(sample.syncId, sample.syncVersion)
        )
    }
}

internal fun toDistanceRecords(samples: Array<NativeDistanceSampleInput>): List<DistanceRecord> {
    return samples.map { sample ->
        DistanceRecord(
            startTime = Instant.ofEpochMilli(sample.startTimeMs.toLong()),
            startZoneOffset = null,
            endTime = Instant.ofEpochMilli(sample.endTimeMs.toLong()),
            endZoneOffset = null,
            distance = Length.meters(sample.distanceMeters),
            metadata = makeSampleMetadata(sample.syncId, sample.syncVersion)
        )
    }
}

internal fun toActiveCaloriesBurnedRecords(
    samples: Array<NativeActiveEnergyBurnedSampleInput>
): List<ActiveCaloriesBurnedRecord> {
    return samples.map { sample ->
        ActiveCaloriesBurnedRecord(
            startTime = Instant.ofEpochMilli(sample.startTimeMs.toLong()),
            startZoneOffset = null,
            endTime = Instant.ofEpochMilli(sample.endTimeMs.toLong()),
            endZoneOffset = null,
            energy = Energy.kilocalories(sample.kilocalories),
            metadata = makeSampleMetadata(sample.syncId, sample.syncVersion)
        )
    }
}

// Each input reading becomes its own single-sample record so it round-trips exactly with
// readHeartRate, which flattens record series into individual readings.
internal fun toHeartRateRecords(samples: Array<NativeHeartRateSampleInput>): List<HeartRateRecord> {
    return samples.map { sample ->
        val time = Instant.ofEpochMilli(sample.timeMs.toLong())

        HeartRateRecord(
            startTime = time,
            startZoneOffset = null,
            endTime = time,
            endZoneOffset = null,
            samples = listOf(
                HeartRateRecord.Sample(
                    time = time,
                    // Health Connect stores whole bpm; round to nearest instead of truncating
                    // so fractional readings (e.g. 72.9) don't lose almost a full beat.
                    beatsPerMinute = sample.bpm.roundToLong()
                )
            ),
            metadata = makeSampleMetadata(sample.syncId, sample.syncVersion)
        )
    }
}

internal fun toWeightRecords(samples: Array<NativeBodyMassSampleInput>): List<WeightRecord> {
    return samples.map { sample ->
        WeightRecord(
            time = Instant.ofEpochMilli(sample.timeMs.toLong()),
            zoneOffset = null,
            weight = Mass.kilograms(sample.kilograms),
            metadata = makeSampleMetadata(sample.syncId, sample.syncVersion)
        )
    }
}

internal fun toRestingHeartRateRecords(
    samples: Array<NativeRestingHeartRateSampleInput>
): List<RestingHeartRateRecord> {
    return samples.map { sample ->
        RestingHeartRateRecord(
            time = Instant.ofEpochMilli(sample.timeMs.toLong()),
            zoneOffset = null,
            // Health Connect stores whole bpm; round to nearest instead of truncating
            // so fractional readings (e.g. 72.9) don't lose almost a full beat.
            beatsPerMinute = sample.bpm.roundToLong(),
            metadata = makeSampleMetadata(sample.syncId, sample.syncVersion)
        )
    }
}

internal fun toOxygenSaturationRecords(
    samples: Array<NativeOxygenSaturationSampleInput>
): List<OxygenSaturationRecord> {
    return samples.map { sample ->
        OxygenSaturationRecord(
            time = Instant.ofEpochMilli(sample.timeMs.toLong()),
            zoneOffset = null,
            percentage = Percentage(sample.percentage),
            metadata = makeSampleMetadata(sample.syncId, sample.syncVersion)
        )
    }
}

internal fun toHeightRecords(samples: Array<NativeHeightSampleInput>): List<HeightRecord> {
    return samples.map { sample ->
        HeightRecord(
            time = Instant.ofEpochMilli(sample.timeMs.toLong()),
            zoneOffset = null,
            height = Length.meters(sample.meters),
            metadata = makeSampleMetadata(sample.syncId, sample.syncVersion)
        )
    }
}
