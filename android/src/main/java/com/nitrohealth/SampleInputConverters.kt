package com.nitrohealth

import androidx.health.connect.client.records.ActiveCaloriesBurnedRecord
import androidx.health.connect.client.records.BasalBodyTemperatureRecord
import androidx.health.connect.client.records.BloodGlucoseRecord
import androidx.health.connect.client.records.BloodPressureRecord
import androidx.health.connect.client.records.BodyFatRecord
import androidx.health.connect.client.records.BodyTemperatureRecord
import androidx.health.connect.client.records.DistanceRecord
import androidx.health.connect.client.records.FloorsClimbedRecord
import androidx.health.connect.client.records.HeartRateRecord
import androidx.health.connect.client.records.HeightRecord
import androidx.health.connect.client.records.HydrationRecord
import androidx.health.connect.client.records.LeanBodyMassRecord
import androidx.health.connect.client.records.NutritionRecord
import androidx.health.connect.client.records.OxygenSaturationRecord
import androidx.health.connect.client.records.RespiratoryRateRecord
import androidx.health.connect.client.records.RestingHeartRateRecord
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.records.Vo2MaxRecord
import androidx.health.connect.client.records.WeightRecord
import androidx.health.connect.client.units.BloodGlucose
import androidx.health.connect.client.units.Energy
import androidx.health.connect.client.units.Length
import androidx.health.connect.client.units.Mass
import androidx.health.connect.client.units.Percentage
import com.margelo.nitro.nitrohealth.NativeBasalBodyTemperatureSampleInput
import com.margelo.nitro.nitrohealth.NativeBodyFatSampleInput
import com.margelo.nitro.nitrohealth.NativeLeanBodyMassSampleInput
import androidx.health.connect.client.units.Temperature
import androidx.health.connect.client.units.Volume
import androidx.health.connect.client.units.Pressure
import com.margelo.nitro.nitrohealth.NativeActiveEnergyBurnedSampleInput
import com.margelo.nitro.nitrohealth.NativeBloodGlucoseSampleInput
import com.margelo.nitro.nitrohealth.NativeBloodPressureSampleInput
import com.margelo.nitro.nitrohealth.NativeBodyMassSampleInput
import com.margelo.nitro.nitrohealth.NativeBodyTemperatureSampleInput
import com.margelo.nitro.nitrohealth.NativeDistanceSampleInput
import com.margelo.nitro.nitrohealth.NativeDistanceScope
import com.margelo.nitro.nitrohealth.NativeFloorsClimbedSampleInput
import com.margelo.nitro.nitrohealth.NativeHeartRateSampleInput
import com.margelo.nitro.nitrohealth.NativeNutritionSampleInput
import com.margelo.nitro.nitrohealth.NativeHydrationSampleInput
import com.margelo.nitro.nitrohealth.NativeHeightSampleInput
import com.margelo.nitro.nitrohealth.NativeOxygenSaturationSampleInput
import com.margelo.nitro.nitrohealth.NativeRespiratoryRateSampleInput
import com.margelo.nitro.nitrohealth.NativeRestingHeartRateSampleInput
import com.margelo.nitro.nitrohealth.NativeStepSampleInput
import com.margelo.nitro.nitrohealth.NativeVo2MaxSampleInput
import java.time.Instant
import kotlin.math.roundToLong

internal fun toStepsRecords(samples: Array<NativeStepSampleInput>): List<StepsRecord> {
    return samples.map { sample ->
        StepsRecord(
            startTime = Instant.ofEpochMilli(sample.startTimeMs.toLong()),
            startZoneOffset = writeZoneOffset(sample.writeMetadata.timeZone, sample.startTimeMs),
            endTime = Instant.ofEpochMilli(sample.endTimeMs.toLong()),
            endZoneOffset = writeZoneOffset(sample.writeMetadata.timeZone, sample.endTimeMs),
            count = sample.count.toLong(),
            metadata = makeSampleMetadata(sample.writeMetadata)
        )
    }
}

internal fun toDistanceRecords(samples: Array<NativeDistanceSampleInput>): List<DistanceRecord> {
    return samples.mapIndexed { index, sample ->
        require(sample.scope == NativeDistanceScope.WALKINGRUNNING) {
            "samples[$index].scope must be walkingRunning"
        }
        DistanceRecord(
            startTime = Instant.ofEpochMilli(sample.startTimeMs.toLong()),
            startZoneOffset = writeZoneOffset(sample.writeMetadata.timeZone, sample.startTimeMs),
            endTime = Instant.ofEpochMilli(sample.endTimeMs.toLong()),
            endZoneOffset = writeZoneOffset(sample.writeMetadata.timeZone, sample.endTimeMs),
            distance = Length.meters(sample.distanceMeters),
            metadata = makeSampleMetadata(sample.writeMetadata)
        )
    }
}

internal fun toActiveCaloriesBurnedRecords(
    samples: Array<NativeActiveEnergyBurnedSampleInput>
): List<ActiveCaloriesBurnedRecord> {
    return samples.map { sample ->
        ActiveCaloriesBurnedRecord(
            startTime = Instant.ofEpochMilli(sample.startTimeMs.toLong()),
            startZoneOffset = writeZoneOffset(sample.writeMetadata.timeZone, sample.startTimeMs),
            endTime = Instant.ofEpochMilli(sample.endTimeMs.toLong()),
            endZoneOffset = writeZoneOffset(sample.writeMetadata.timeZone, sample.endTimeMs),
            energy = Energy.kilocalories(sample.kilocalories),
            metadata = makeSampleMetadata(sample.writeMetadata)
        )
    }
}

internal fun toHydrationRecords(
    samples: Array<NativeHydrationSampleInput>
): List<HydrationRecord> {
    return samples.map { sample ->
        HydrationRecord(
            startTime = Instant.ofEpochMilli(sample.startTimeMs.toLong()),
            startZoneOffset = writeZoneOffset(sample.writeMetadata.timeZone, sample.startTimeMs),
            endTime = Instant.ofEpochMilli(sample.endTimeMs.toLong()),
            endZoneOffset = writeZoneOffset(sample.writeMetadata.timeZone, sample.endTimeMs),
            volume = Volume.milliliters(sample.milliliters),
            metadata = makeSampleMetadata(sample.writeMetadata)
        )
    }
}

internal fun toFloorsClimbedRecords(
    samples: Array<NativeFloorsClimbedSampleInput>
): List<FloorsClimbedRecord> {
    return samples.map { sample ->
        FloorsClimbedRecord(
            startTime = Instant.ofEpochMilli(sample.startTimeMs.toLong()),
            startZoneOffset = writeZoneOffset(sample.writeMetadata.timeZone, sample.startTimeMs),
            endTime = Instant.ofEpochMilli(sample.endTimeMs.toLong()),
            endZoneOffset = writeZoneOffset(sample.writeMetadata.timeZone, sample.endTimeMs),
            floors = sample.floors,
            metadata = makeSampleMetadata(sample.writeMetadata)
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
            startZoneOffset = writeZoneOffset(sample.writeMetadata.timeZone, sample.timeMs),
            endTime = time,
            endZoneOffset = writeZoneOffset(sample.writeMetadata.timeZone, sample.timeMs),
            samples = listOf(
                HeartRateRecord.Sample(
                    time = time,
                    // Health Connect stores whole bpm; round to nearest instead of truncating
                    // so fractional readings (e.g. 72.9) don't lose almost a full beat.
                    beatsPerMinute = sample.bpm.roundToLong()
                )
            ),
            metadata = makeSampleMetadata(sample.writeMetadata)
        )
    }
}

internal fun toBloodPressureRecords(
    samples: Array<NativeBloodPressureSampleInput>
): List<BloodPressureRecord> {
    return samples.map { sample ->
        BloodPressureRecord(
            time = Instant.ofEpochMilli(sample.timeMs.toLong()),
            zoneOffset = writeZoneOffset(sample.writeMetadata.timeZone, sample.timeMs),
            systolic = Pressure.millimetersOfMercury(sample.systolicMmHg),
            diastolic = Pressure.millimetersOfMercury(sample.diastolicMmHg),
            bodyPosition = healthConnectBloodPressureBodyPosition(sample.androidBodyPosition),
            measurementLocation = healthConnectBloodPressureMeasurementLocation(
                sample.androidMeasurementLocation
            ),
            metadata = makeSampleMetadata(sample.writeMetadata)
        )
    }
}

internal fun toNutritionRecords(
    samples: Array<NativeNutritionSampleInput>
): List<NutritionRecord> {
    return samples.map { sample ->
        NutritionRecord(
            startTime = Instant.ofEpochMilli(sample.startTimeMs.toLong()),
            startZoneOffset = writeZoneOffset(sample.writeMetadata.timeZone, sample.startTimeMs),
            endTime = Instant.ofEpochMilli(sample.endTimeMs.toLong()),
            endZoneOffset = writeZoneOffset(sample.writeMetadata.timeZone, sample.endTimeMs),
            energy = sample.energyKilocalories?.let(Energy::kilocalories),
            protein = sample.proteinGrams?.let(Mass::grams),
            totalCarbohydrate = sample.totalCarbohydrateGrams?.let(Mass::grams),
            totalFat = sample.totalFatGrams?.let(Mass::grams),
            dietaryFiber = sample.dietaryFiberGrams?.let(Mass::grams),
            sugar = sample.sugarGrams?.let(Mass::grams),
            sodium = sample.sodiumMilligrams?.let(Mass::milligrams),
            name = sample.foodName,
            mealType = healthConnectNutritionMealType(sample.mealType),
            metadata = makeSampleMetadata(sample.writeMetadata)
        )
    }
}

internal fun toBloodGlucoseRecords(
    samples: Array<NativeBloodGlucoseSampleInput>
): List<BloodGlucoseRecord> {
    return samples.map { sample ->
        BloodGlucoseRecord(
            time = Instant.ofEpochMilli(sample.timeMs.toLong()),
            zoneOffset = writeZoneOffset(sample.writeMetadata.timeZone, sample.timeMs),
            metadata = makeSampleMetadata(sample.writeMetadata),
            level = BloodGlucose.millimolesPerLiter(sample.millimolesPerLiter),
            specimenSource = healthConnectBloodGlucoseSpecimenSource(sample.androidSpecimenSource),
            mealType = healthConnectBloodGlucoseMealType(sample.androidMealType),
            relationToMeal = healthConnectBloodGlucoseRelationToMeal(sample.androidRelationToMeal)
        )
    }
}

internal fun toBodyTemperatureRecords(
    samples: Array<NativeBodyTemperatureSampleInput>
): List<BodyTemperatureRecord> {
    return samples.map { sample ->
        BodyTemperatureRecord(
            time = Instant.ofEpochMilli(sample.timeMs.toLong()),
            zoneOffset = writeZoneOffset(sample.writeMetadata.timeZone, sample.timeMs),
            metadata = makeSampleMetadata(sample.writeMetadata),
            temperature = Temperature.celsius(sample.celsius),
            measurementLocation = sample.androidMeasurementLocation
                .toHealthConnectBodyTemperatureMeasurementLocation()
        )
    }
}

internal fun toBodyFatRecords(
    samples: Array<NativeBodyFatSampleInput>
): List<BodyFatRecord> {
    return samples.map { sample ->
        BodyFatRecord(
            time = Instant.ofEpochMilli(sample.timeMs.toLong()),
            zoneOffset = writeZoneOffset(sample.writeMetadata.timeZone, sample.timeMs),
            metadata = makeSampleMetadata(sample.writeMetadata),
            percentage = Percentage(sample.percentage)
        )
    }
}

internal fun toLeanBodyMassRecords(
    samples: Array<NativeLeanBodyMassSampleInput>
): List<LeanBodyMassRecord> {
    return samples.map { sample ->
        LeanBodyMassRecord(
            time = Instant.ofEpochMilli(sample.timeMs.toLong()),
            zoneOffset = writeZoneOffset(sample.writeMetadata.timeZone, sample.timeMs),
            metadata = makeSampleMetadata(sample.writeMetadata),
            mass = Mass.kilograms(sample.kilograms)
        )
    }
}

internal fun toBasalBodyTemperatureRecords(
    samples: Array<NativeBasalBodyTemperatureSampleInput>
): List<BasalBodyTemperatureRecord> {
    return samples.map { sample ->
        BasalBodyTemperatureRecord(
            time = Instant.ofEpochMilli(sample.timeMs.toLong()),
            zoneOffset = writeZoneOffset(sample.writeMetadata.timeZone, sample.timeMs),
            metadata = makeSampleMetadata(sample.writeMetadata),
            temperature = Temperature.celsius(sample.celsius),
            measurementLocation = sample.androidMeasurementLocation
                .toHealthConnectBodyTemperatureMeasurementLocation()
        )
    }
}

internal fun toRespiratoryRateRecords(
    samples: Array<NativeRespiratoryRateSampleInput>
): List<RespiratoryRateRecord> {
    return samples.map { sample ->
        RespiratoryRateRecord(
            time = Instant.ofEpochMilli(sample.timeMs.toLong()),
            zoneOffset = writeZoneOffset(sample.writeMetadata.timeZone, sample.timeMs),
            metadata = makeSampleMetadata(sample.writeMetadata),
            rate = sample.breathsPerMinute
        )
    }
}

internal fun toWeightRecords(samples: Array<NativeBodyMassSampleInput>): List<WeightRecord> {
    return samples.map { sample ->
        WeightRecord(
            time = Instant.ofEpochMilli(sample.timeMs.toLong()),
            zoneOffset = writeZoneOffset(sample.writeMetadata.timeZone, sample.timeMs),
            weight = Mass.kilograms(sample.kilograms),
            metadata = makeSampleMetadata(sample.writeMetadata)
        )
    }
}

internal fun toRestingHeartRateRecords(
    samples: Array<NativeRestingHeartRateSampleInput>
): List<RestingHeartRateRecord> {
    return samples.map { sample ->
        RestingHeartRateRecord(
            time = Instant.ofEpochMilli(sample.timeMs.toLong()),
            zoneOffset = writeZoneOffset(sample.writeMetadata.timeZone, sample.timeMs),
            // Health Connect stores whole bpm; round to nearest instead of truncating
            // so fractional readings (e.g. 72.9) don't lose almost a full beat.
            beatsPerMinute = sample.bpm.roundToLong(),
            metadata = makeSampleMetadata(sample.writeMetadata)
        )
    }
}

internal fun toOxygenSaturationRecords(
    samples: Array<NativeOxygenSaturationSampleInput>
): List<OxygenSaturationRecord> {
    return samples.map { sample ->
        OxygenSaturationRecord(
            time = Instant.ofEpochMilli(sample.timeMs.toLong()),
            zoneOffset = writeZoneOffset(sample.writeMetadata.timeZone, sample.timeMs),
            percentage = Percentage(sample.percentage),
            metadata = makeSampleMetadata(sample.writeMetadata)
        )
    }
}

internal fun toHeightRecords(samples: Array<NativeHeightSampleInput>): List<HeightRecord> {
    return samples.map { sample ->
        HeightRecord(
            time = Instant.ofEpochMilli(sample.timeMs.toLong()),
            zoneOffset = writeZoneOffset(sample.writeMetadata.timeZone, sample.timeMs),
            height = Length.meters(sample.meters),
            metadata = makeSampleMetadata(sample.writeMetadata)
        )
    }
}

internal fun toVo2MaxRecords(samples: Array<NativeVo2MaxSampleInput>): List<Vo2MaxRecord> {
    return samples.map { sample ->
        Vo2MaxRecord(
            time = Instant.ofEpochMilli(sample.timeMs.toLong()),
            zoneOffset = writeZoneOffset(sample.writeMetadata.timeZone, sample.timeMs),
            vo2MillilitersPerMinuteKilogram = sample.millilitersPerKilogramPerMinute,
            measurementMethod = healthConnectVo2MaxMeasurementMethod(sample.androidMeasurementMethod),
            metadata = makeSampleMetadata(sample.writeMetadata)
        )
    }
}
