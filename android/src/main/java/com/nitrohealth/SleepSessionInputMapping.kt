package com.nitrohealth

import androidx.health.connect.client.records.SleepSessionRecord
import com.margelo.nitro.nitrohealth.NativeSleepSessionInput
import com.margelo.nitro.nitrohealth.NativeSleepSessionStageInput
import java.time.Instant

internal fun toSleepSessionRecords(
    sessions: Array<NativeSleepSessionInput>
): List<SleepSessionRecord> {
    return sessions.mapIndexed { sessionIndex, session ->
        val startTime = Instant.ofEpochMilli(session.startTimeMs.toLong())
        val endTime = Instant.ofEpochMilli(session.endTimeMs.toLong())
        val zoneId = resolveIanaZoneId(session.writeMetadata.timeZone, "sessions[$sessionIndex]")

        SleepSessionRecord(
            startTime = startTime,
            startZoneOffset = zoneId.rules.getOffset(startTime),
            endTime = endTime,
            endZoneOffset = zoneId.rules.getOffset(endTime),
            title = session.androidTitle,
            notes = session.androidNotes,
            stages = session.stages.map(::toSleepSessionStage),
            metadata = makeSampleMetadata(session.writeMetadata)
        )
    }
}

private fun toSleepSessionStage(stage: NativeSleepSessionStageInput): SleepSessionRecord.Stage {
    return SleepSessionRecord.Stage(
        startTime = Instant.ofEpochMilli(stage.startTimeMs.toLong()),
        endTime = Instant.ofEpochMilli(stage.endTimeMs.toLong()),
        stage = toHealthConnectSleepStage(stage.stage)
    )
}

internal fun toHealthConnectSleepStage(stage: String): Int {
    return when (stage) {
        "awake" -> SleepSessionRecord.STAGE_TYPE_AWAKE
        "asleep" -> SleepSessionRecord.STAGE_TYPE_SLEEPING
        "asleepCore" -> SleepSessionRecord.STAGE_TYPE_LIGHT
        "asleepDeep" -> SleepSessionRecord.STAGE_TYPE_DEEP
        "asleepREM" -> SleepSessionRecord.STAGE_TYPE_REM
        else -> throw IllegalArgumentException("Unsupported writable sleep stage: $stage")
    }
}
