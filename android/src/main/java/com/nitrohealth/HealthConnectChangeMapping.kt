package com.nitrohealth

import androidx.health.connect.client.changes.Change
import androidx.health.connect.client.changes.DeletionChange
import androidx.health.connect.client.changes.UpsertionChange
import androidx.health.connect.client.records.ActiveCaloriesBurnedRecord
import androidx.health.connect.client.records.DistanceRecord
import androidx.health.connect.client.records.ExerciseSessionRecord
import androidx.health.connect.client.records.HeartRateRecord
import androidx.health.connect.client.records.HeartRateVariabilityRmssdRecord
import androidx.health.connect.client.records.HeightRecord
import androidx.health.connect.client.records.OxygenSaturationRecord
import androidx.health.connect.client.records.Record
import androidx.health.connect.client.records.RestingHeartRateRecord
import androidx.health.connect.client.records.SleepSessionRecord
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.records.WeightRecord
import com.margelo.nitro.nitrohealth.NativeActiveEnergyBurnedSample
import com.margelo.nitro.nitrohealth.NativeBodyMassSample
import com.margelo.nitro.nitrohealth.NativeDistanceSample
import com.margelo.nitro.nitrohealth.NativeHealthChange
import com.margelo.nitro.nitrohealth.NativeHeartRateSample
import com.margelo.nitro.nitrohealth.NativeHeartRateVariabilitySample
import com.margelo.nitro.nitrohealth.NativeHeightSample
import com.margelo.nitro.nitrohealth.NativeOxygenSaturationSample
import com.margelo.nitro.nitrohealth.NativeRestingHeartRateSample
import com.margelo.nitro.nitrohealth.NativeSleepSample
import com.margelo.nitro.nitrohealth.NativeStepSample
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
            recordUuid = change.recordId
        )
        else -> throw IllegalStateException(
            "Health Connect returned an unsupported change type: ${change.javaClass.name}"
        )
    }
}

internal fun makeNativeHeartRateSamples(
    record: HeartRateRecord
): Array<NativeHeartRateSample> {
    return record.samples.mapIndexed { index, sample ->
        NativeHeartRateSample(
            uuid = "${record.metadata.id}#$index",
            recordUuid = record.metadata.id,
            timeMs = sample.time.toEpochMilli().toDouble(),
            bpm = sample.beatsPerMinute.toDouble(),
            source = record.metadata.dataOrigin.packageName
        )
    }.toTypedArray()
}

internal fun makeNativeSleepSamples(record: SleepSessionRecord): Array<NativeSleepSample> {
    val stages = record.stages
    if (stages.isEmpty()) {
        return arrayOf(
            NativeSleepSample(
                uuid = record.metadata.id,
                recordUuid = record.metadata.id,
                startTimeMs = record.startTime.toEpochMilli().toDouble(),
                endTimeMs = record.endTime.toEpochMilli().toDouble(),
                stage = "asleep",
                source = record.metadata.dataOrigin.packageName
            )
        )
    }

    return stages.mapIndexed { index, stage ->
        NativeSleepSample(
            uuid = "${record.metadata.id}#$index",
            recordUuid = record.metadata.id,
            startTimeMs = stage.startTime.toEpochMilli().toDouble(),
            endTimeMs = stage.endTime.toEpochMilli().toDouble(),
            stage = makeSleepStage(stage.stage),
            source = record.metadata.dataOrigin.packageName
        )
    }.toTypedArray()
}

private fun makeNativeUpsertionChange(record: Record): NativeHealthChange {
    val recordUuid = record.metadata.id
    return when (record) {
        is StepsRecord -> makeNativeChange(
            type = "upsert",
            recordUuid = recordUuid,
            stepSamples = arrayOf(
                NativeStepSample(
                    uuid = recordUuid,
                    startTimeMs = record.startTime.toEpochMilli().toDouble(),
                    endTimeMs = record.endTime.toEpochMilli().toDouble(),
                    count = record.count.toDouble()
                )
            )
        )
        is HeartRateRecord -> makeNativeChange(
            type = "upsert",
            recordUuid = recordUuid,
            heartRateSamples = makeNativeHeartRateSamples(record)
        )
        is RestingHeartRateRecord -> makeNativeChange(
            type = "upsert",
            recordUuid = recordUuid,
            restingHeartRateSamples = arrayOf(
                NativeRestingHeartRateSample(
                    uuid = recordUuid,
                    timeMs = record.time.toEpochMilli().toDouble(),
                    bpm = record.beatsPerMinute.toDouble(),
                    source = record.metadata.dataOrigin.packageName
                )
            )
        )
        is HeartRateVariabilityRmssdRecord -> makeNativeChange(
            type = "upsert",
            recordUuid = recordUuid,
            heartRateVariabilitySamples = arrayOf(
                NativeHeartRateVariabilitySample(
                    uuid = recordUuid,
                    timeMs = record.time.toEpochMilli().toDouble(),
                    milliseconds = record.heartRateVariabilityMillis,
                    method = "rmssd",
                    source = record.metadata.dataOrigin.packageName
                )
            )
        )
        is DistanceRecord -> makeNativeChange(
            type = "upsert",
            recordUuid = recordUuid,
            distanceSamples = arrayOf(
                NativeDistanceSample(
                    uuid = recordUuid,
                    startTimeMs = record.startTime.toEpochMilli().toDouble(),
                    endTimeMs = record.endTime.toEpochMilli().toDouble(),
                    distanceMeters = record.distance.inMeters
                )
            )
        )
        is ActiveCaloriesBurnedRecord -> makeNativeChange(
            type = "upsert",
            recordUuid = recordUuid,
            activeEnergyBurnedSamples = arrayOf(
                NativeActiveEnergyBurnedSample(
                    uuid = recordUuid,
                    startTimeMs = record.startTime.toEpochMilli().toDouble(),
                    endTimeMs = record.endTime.toEpochMilli().toDouble(),
                    kilocalories = record.energy.inKilocalories
                )
            )
        )
        is OxygenSaturationRecord -> makeNativeChange(
            type = "upsert",
            recordUuid = recordUuid,
            oxygenSaturationSamples = arrayOf(
                NativeOxygenSaturationSample(
                    uuid = recordUuid,
                    timeMs = record.time.toEpochMilli().toDouble(),
                    percentage = record.percentage.value,
                    source = record.metadata.dataOrigin.packageName
                )
            )
        )
        is HeightRecord -> makeNativeChange(
            type = "upsert",
            recordUuid = recordUuid,
            heightSamples = arrayOf(
                NativeHeightSample(
                    uuid = recordUuid,
                    timeMs = record.time.toEpochMilli().toDouble(),
                    meters = record.height.inMeters,
                    source = record.metadata.dataOrigin.packageName
                )
            )
        )
        is SleepSessionRecord -> makeNativeChange(
            type = "upsert",
            recordUuid = recordUuid,
            sleepSamples = makeNativeSleepSamples(record)
        )
        is WeightRecord -> makeNativeChange(
            type = "upsert",
            recordUuid = recordUuid,
            bodyMassSamples = arrayOf(
                NativeBodyMassSample(
                    uuid = recordUuid,
                    startTimeMs = record.time.toEpochMilli().toDouble(),
                    endTimeMs = record.time.toEpochMilli().toDouble(),
                    kilograms = record.weight.inKilograms,
                    source = record.metadata.dataOrigin.packageName
                )
            )
        )
        is ExerciseSessionRecord -> makeNativeChange(
            type = "upsert",
            recordUuid = recordUuid,
            workoutSamples = arrayOf(
                NativeWorkoutSample(
                    uuid = recordUuid,
                    startTimeMs = record.startTime.toEpochMilli().toDouble(),
                    endTimeMs = record.endTime.toEpochMilli().toDouble(),
                    durationSeconds =
                        (record.endTime.toEpochMilli() - record.startTime.toEpochMilli()) / 1000.0,
                    activityType = makeWorkoutActivityType(record.exerciseType),
                    title = record.title,
                    source = record.metadata.dataOrigin.packageName,
                    totalDistanceMeters = null,
                    totalEnergyBurnedKcal = null
                )
            )
        )
        else -> throw IllegalStateException(
            "Health Connect returned an unsupported record type: ${record.javaClass.name}"
        )
    }
}

private fun makeNativeChange(
    type: String,
    recordUuid: String,
    stepSamples: Array<NativeStepSample>? = null,
    heartRateSamples: Array<NativeHeartRateSample>? = null,
    restingHeartRateSamples: Array<NativeRestingHeartRateSample>? = null,
    heartRateVariabilitySamples: Array<NativeHeartRateVariabilitySample>? = null,
    distanceSamples: Array<NativeDistanceSample>? = null,
    activeEnergyBurnedSamples: Array<NativeActiveEnergyBurnedSample>? = null,
    oxygenSaturationSamples: Array<NativeOxygenSaturationSample>? = null,
    heightSamples: Array<NativeHeightSample>? = null,
    sleepSamples: Array<NativeSleepSample>? = null,
    bodyMassSamples: Array<NativeBodyMassSample>? = null,
    workoutSamples: Array<NativeWorkoutSample>? = null
): NativeHealthChange {
    return NativeHealthChange(
        type = type,
        recordUuid = recordUuid,
        stepSamples = stepSamples,
        heartRateSamples = heartRateSamples,
        restingHeartRateSamples = restingHeartRateSamples,
        heartRateVariabilitySamples = heartRateVariabilitySamples,
        distanceSamples = distanceSamples,
        activeEnergyBurnedSamples = activeEnergyBurnedSamples,
        oxygenSaturationSamples = oxygenSaturationSamples,
        heightSamples = heightSamples,
        sleepSamples = sleepSamples,
        bodyMassSamples = bodyMassSamples,
        workoutSamples = workoutSamples,
        dummyNonEquatable = null
    )
}

private fun makeSleepStage(stage: Int): String {
    return when (stage) {
        1 -> "awake"
        2 -> "asleep"
        3 -> "outOfBed"
        4 -> "asleepCore"
        5 -> "asleepDeep"
        6 -> "asleepREM"
        7 -> "awakeInBed"
        else -> "unknown"
    }
}
