package com.nitrohealth

import androidx.health.connect.client.changes.Change
import androidx.health.connect.client.changes.DeletionChange
import androidx.health.connect.client.changes.UpsertionChange
import androidx.health.connect.client.records.ActiveCaloriesBurnedRecord
import androidx.health.connect.client.records.BasalBodyTemperatureRecord
import androidx.health.connect.client.records.BloodGlucoseRecord
import androidx.health.connect.client.records.BloodPressureRecord
import androidx.health.connect.client.records.BodyFatRecord
import androidx.health.connect.client.records.BodyTemperatureRecord
import androidx.health.connect.client.records.DistanceRecord
import androidx.health.connect.client.records.ExerciseSessionRecord
import androidx.health.connect.client.records.FloorsClimbedRecord
import androidx.health.connect.client.records.HeartRateRecord
import androidx.health.connect.client.records.HeartRateVariabilityRmssdRecord
import androidx.health.connect.client.records.HeightRecord
import androidx.health.connect.client.records.HydrationRecord
import androidx.health.connect.client.records.LeanBodyMassRecord
import androidx.health.connect.client.records.NutritionRecord
import androidx.health.connect.client.records.OxygenSaturationRecord
import androidx.health.connect.client.records.Record
import androidx.health.connect.client.records.RespiratoryRateRecord
import androidx.health.connect.client.records.RestingHeartRateRecord
import androidx.health.connect.client.records.SleepSessionRecord
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.records.Vo2MaxRecord
import androidx.health.connect.client.records.WeightRecord
import com.margelo.nitro.nitrohealth.NativeActiveEnergyBurnedSample
import com.margelo.nitro.nitrohealth.NativeBloodGlucoseSample
import com.margelo.nitro.nitrohealth.NativeBloodPressureSample
import com.margelo.nitro.nitrohealth.NativeBasalBodyTemperatureSample
import com.margelo.nitro.nitrohealth.NativeBodyFatSample
import com.margelo.nitro.nitrohealth.NativeBodyTemperatureSample
import com.margelo.nitro.nitrohealth.NativeBodyMassSample
import com.margelo.nitro.nitrohealth.NativeDistanceSample
import com.margelo.nitro.nitrohealth.NativeHealthChange
import com.margelo.nitro.nitrohealth.NativeFloorsClimbedSample
import com.margelo.nitro.nitrohealth.NativeHeartRateSample
import com.margelo.nitro.nitrohealth.NativeHeartRateVariabilitySample
import com.margelo.nitro.nitrohealth.NativeHeightSample
import com.margelo.nitro.nitrohealth.NativeHydrationSample
import com.margelo.nitro.nitrohealth.NativeLeanBodyMassSample
import com.margelo.nitro.nitrohealth.NativeNutritionSample
import com.margelo.nitro.nitrohealth.NativeOxygenSaturationSample
import com.margelo.nitro.nitrohealth.NativeRespiratoryRateSample
import com.margelo.nitro.nitrohealth.NativeRestingHeartRateSample
import com.margelo.nitro.nitrohealth.NativeSleepSample
import com.margelo.nitro.nitrohealth.NativeStepSample
import com.margelo.nitro.nitrohealth.NativeVo2MaxSample
import com.margelo.nitro.nitrohealth.NativeWorkoutSample
import kotlin.reflect.KClass

internal fun makeNativeHealthChange(
    change: Change,
    dataType: String,
    expectedRecordType: KClass<out Record>
): NativeHealthChange {
    return when (change) {
        is UpsertionChange -> {
            val record = change.record
            if (record::class != expectedRecordType) {
                throw IllegalStateException(
                    "Health Connect returned record type '${record.javaClass.name}' for '$dataType'" +
                        " changes; expected '${expectedRecordType.java.name}'"
                )
            }
            makeNativeUpsertionChange(record)
        }
        is DeletionChange -> makeNativeChange(
            type = "delete",
            recordId = change.recordId
        )
        else -> throw IllegalStateException(
            "Health Connect returned an unsupported change type: ${change.javaClass.name}"
        )
    }
}

private fun makeNativeUpsertionChange(record: Record): NativeHealthChange {
    val recordId = record.metadata.id
    return when (record) {
        is StepsRecord -> makeNativeChange(
            type = "upsert",
            recordId = recordId,
            stepSamples = arrayOf(makeNativeStepSample(record))
        )
        is HeartRateRecord -> makeNativeChange(
            type = "upsert",
            recordId = recordId,
            heartRateSamples = makeNativeHeartRateSamples(record)
        )
        is BloodPressureRecord -> makeNativeChange(
            type = "upsert",
            recordId = recordId,
            bloodPressureSamples = arrayOf(makeNativeBloodPressureSample(record))
        )
        is BloodGlucoseRecord -> makeNativeChange(
            type = "upsert",
            recordId = recordId,
            bloodGlucoseSamples = arrayOf(makeNativeBloodGlucoseSample(record))
        )
        is BodyTemperatureRecord -> makeNativeChange(
            type = "upsert",
            recordId = recordId,
            bodyTemperatureSamples = arrayOf(makeNativeBodyTemperatureSample(record))
        )
        is RespiratoryRateRecord -> makeNativeChange(
            type = "upsert",
            recordId = recordId,
            respiratoryRateSamples = arrayOf(makeNativeRespiratoryRateSample(record))
        )
        is BodyFatRecord -> makeNativeChange(
            type = "upsert",
            recordId = recordId,
            bodyFatSamples = arrayOf(makeNativeBodyFatSample(record))
        )
        is LeanBodyMassRecord -> makeNativeChange(
            type = "upsert",
            recordId = recordId,
            leanBodyMassSamples = arrayOf(makeNativeLeanBodyMassSample(record))
        )
        is BasalBodyTemperatureRecord -> makeNativeChange(
            type = "upsert",
            recordId = recordId,
            basalBodyTemperatureSamples = arrayOf(makeNativeBasalBodyTemperatureSample(record))
        )
        is RestingHeartRateRecord -> makeNativeChange(
            type = "upsert",
            recordId = recordId,
            restingHeartRateSamples = arrayOf(makeNativeRestingHeartRateSample(record))
        )
        is HeartRateVariabilityRmssdRecord -> makeNativeChange(
            type = "upsert",
            recordId = recordId,
            heartRateVariabilitySamples = arrayOf(makeNativeHeartRateVariabilitySample(record))
        )
        is DistanceRecord -> makeNativeChange(
            type = "upsert",
            recordId = recordId,
            distanceSamples = arrayOf(makeNativeDistanceSample(record))
        )
        is ActiveCaloriesBurnedRecord -> makeNativeChange(
            type = "upsert",
            recordId = recordId,
            activeEnergyBurnedSamples = arrayOf(makeNativeActiveEnergyBurnedSample(record))
        )
        is HydrationRecord -> makeNativeChange(
            type = "upsert",
            recordId = recordId,
            hydrationSamples = arrayOf(makeNativeHydrationSample(record))
        )
        is FloorsClimbedRecord -> makeNativeChange(
            type = "upsert",
            recordId = recordId,
            floorsClimbedSamples = arrayOf(makeNativeFloorsClimbedSample(record))
        )
        is OxygenSaturationRecord -> makeNativeChange(
            type = "upsert",
            recordId = recordId,
            oxygenSaturationSamples = arrayOf(makeNativeOxygenSaturationSample(record))
        )
        is HeightRecord -> makeNativeChange(
            type = "upsert",
            recordId = recordId,
            heightSamples = arrayOf(makeNativeHeightSample(record))
        )
        is Vo2MaxRecord -> makeNativeChange(
            type = "upsert",
            recordId = recordId,
            vo2MaxSamples = arrayOf(
                makeNativeVo2MaxSample(record)
            )
        )
        is SleepSessionRecord -> makeNativeChange(
            type = "upsert",
            recordId = recordId,
            sleepSamples = makeNativeSleepSamples(record)
        )
        is WeightRecord -> makeNativeChange(
            type = "upsert",
            recordId = recordId,
            bodyMassSamples = arrayOf(makeNativeBodyMassSample(record))
        )
        is ExerciseSessionRecord -> makeNativeChange(
            type = "upsert",
            recordId = recordId,
            workoutSamples = arrayOf(makeNativeWorkoutSample(record))
        )
        is NutritionRecord -> makeNativeChange(
            type = "upsert",
            recordId = recordId,
            nutritionSamples = arrayOf(makeNativeNutritionSample(record))
        )
        else -> throw IllegalStateException(
            "Health Connect returned an unsupported record type: ${record.javaClass.name}"
        )
    }
}

private fun makeNativeChange(
    type: String,
    recordId: String,
    stepSamples: Array<NativeStepSample>? = null,
    heartRateSamples: Array<NativeHeartRateSample>? = null,
    bloodPressureSamples: Array<NativeBloodPressureSample>? = null,
    bloodGlucoseSamples: Array<NativeBloodGlucoseSample>? = null,
    bodyTemperatureSamples: Array<NativeBodyTemperatureSample>? = null,
    respiratoryRateSamples: Array<NativeRespiratoryRateSample>? = null,
    bodyFatSamples: Array<NativeBodyFatSample>? = null,
    leanBodyMassSamples: Array<NativeLeanBodyMassSample>? = null,
    basalBodyTemperatureSamples: Array<NativeBasalBodyTemperatureSample>? = null,
    restingHeartRateSamples: Array<NativeRestingHeartRateSample>? = null,
    heartRateVariabilitySamples: Array<NativeHeartRateVariabilitySample>? = null,
    distanceSamples: Array<NativeDistanceSample>? = null,
    activeEnergyBurnedSamples: Array<NativeActiveEnergyBurnedSample>? = null,
    hydrationSamples: Array<NativeHydrationSample>? = null,
    floorsClimbedSamples: Array<NativeFloorsClimbedSample>? = null,
    oxygenSaturationSamples: Array<NativeOxygenSaturationSample>? = null,
    heightSamples: Array<NativeHeightSample>? = null,
    vo2MaxSamples: Array<NativeVo2MaxSample>? = null,
    sleepSamples: Array<NativeSleepSample>? = null,
    bodyMassSamples: Array<NativeBodyMassSample>? = null,
    workoutSamples: Array<NativeWorkoutSample>? = null,
    nutritionSamples: Array<NativeNutritionSample>? = null
): NativeHealthChange {
    return NativeHealthChange(
        type = type,
        recordId = recordId,
        stepSamples = stepSamples,
        heartRateSamples = heartRateSamples,
        bloodPressureSamples = bloodPressureSamples,
        bloodGlucoseSamples = bloodGlucoseSamples,
        bodyTemperatureSamples = bodyTemperatureSamples,
        respiratoryRateSamples = respiratoryRateSamples,
        bodyFatSamples = bodyFatSamples,
        leanBodyMassSamples = leanBodyMassSamples,
        basalBodyTemperatureSamples = basalBodyTemperatureSamples,
        restingHeartRateSamples = restingHeartRateSamples,
        heartRateVariabilitySamples = heartRateVariabilitySamples,
        distanceSamples = distanceSamples,
        activeEnergyBurnedSamples = activeEnergyBurnedSamples,
        hydrationSamples = hydrationSamples,
        floorsClimbedSamples = floorsClimbedSamples,
        oxygenSaturationSamples = oxygenSaturationSamples,
        heightSamples = heightSamples,
        vo2MaxSamples = vo2MaxSamples,
        sleepSamples = sleepSamples,
        bodyMassSamples = bodyMassSamples,
        workoutSamples = workoutSamples,
        nutritionSamples = nutritionSamples,
        dummyNonEquatable = null
    )
}
