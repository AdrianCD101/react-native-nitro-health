package com.nitrohealth

import androidx.health.connect.client.records.SleepSessionRecord
import com.margelo.nitro.nitrohealth.NativeSleepSample
import com.margelo.nitro.nitrohealth.NativeSleepSampleKind
import com.margelo.nitro.nitrohealth.NativeSleepStageData

internal fun makeNativeSleepSamples(record: SleepSessionRecord): Array<NativeSleepSample> {
    val recordId = record.metadata.id
    val envelope = NativeSleepSample(
        sampleMetadata = makeNativeHealthSampleMetadata(record.metadata, record.startZoneOffset),
        kind = NativeSleepSampleKind.SESSIONENVELOPE,
        startTimeMs = record.startTime.toEpochMilli().toDouble(),
        endTimeMs = record.endTime.toEpochMilli().toDouble(),
        stage = null,
        stageData = if (record.stages.isEmpty()) {
            NativeSleepStageData.NOTREPORTED
        } else {
            NativeSleepStageData.REPORTED
        },
        androidTitle = record.title,
        androidNotes = record.notes
    )
    val stages = record.stages.mapIndexed { index, stage ->
        NativeSleepSample(
            sampleMetadata = makeNativeHealthSampleMetadata(
                record.metadata,
                record.startZoneOffset,
                makeRecordChildIdentity(recordId, index)
            ),
            kind = NativeSleepSampleKind.STAGE,
            startTimeMs = stage.startTime.toEpochMilli().toDouble(),
            endTimeMs = stage.endTime.toEpochMilli().toDouble(),
            stage = makeSleepStage(stage.stage),
            stageData = null,
            androidTitle = null,
            androidNotes = null
        )
    }

    return (listOf(envelope) + stages).toTypedArray()
}

internal fun makeSleepStage(stage: Int): String {
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
