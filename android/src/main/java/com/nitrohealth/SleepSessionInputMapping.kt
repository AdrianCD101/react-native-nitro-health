package com.nitrohealth

import androidx.health.connect.client.records.SleepSessionRecord
import androidx.health.connect.client.records.metadata.Metadata
import com.margelo.nitro.nitrohealth.NativeSleepSessionInput
import com.margelo.nitro.nitrohealth.NativeSleepSessionStageInput
import java.time.DateTimeException
import java.time.Instant
import java.time.ZoneId

internal fun toSleepSessionRecords(
    sessions: Array<NativeSleepSessionInput>
): List<SleepSessionRecord> {
    return sessions.mapIndexed { sessionIndex, session ->
        val startTime = Instant.ofEpochMilli(session.startTimeMs.toLong())
        val endTime = Instant.ofEpochMilli(session.endTimeMs.toLong())
        val zoneId = resolveSleepSessionZoneId(session.timeZone, sessionIndex)

        SleepSessionRecord(
            startTime = startTime,
            startZoneOffset = zoneId.rules.getOffset(startTime),
            endTime = endTime,
            endZoneOffset = zoneId.rules.getOffset(endTime),
            stages = session.stages.map(::toSleepSessionStage),
            metadata = Metadata.unknownRecordingMethod()
        )
    }
}

private fun resolveSleepSessionZoneId(timeZone: String?, sessionIndex: Int): ZoneId {
    if (timeZone == null) return ZoneId.systemDefault()

    if (timeZone != "UTC" && timeZone !in ZoneId.getAvailableZoneIds()) {
        throw IllegalArgumentException(
            "sessions[$sessionIndex]: timeZone is not a valid IANA time-zone identifier: $timeZone"
        )
    }

    return try {
        ZoneId.of(timeZone)
    } catch (error: DateTimeException) {
        throw IllegalArgumentException(
            "sessions[$sessionIndex]: timeZone is not a valid IANA time-zone identifier: $timeZone",
            error
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
