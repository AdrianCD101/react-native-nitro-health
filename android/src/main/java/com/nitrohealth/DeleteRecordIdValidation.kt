package com.nitrohealth

/**
 * Validates uuids passed to deleteSamplesByUuids and returns them as the list Health Connect
 * expects.
 *
 * readHeartRate and readSleepSamples flatten series/session records into individual readings
 * under synthetic "<recordId>#<index>" ids. Health Connect can only delete whole records, so
 * deleting by a synthetic id would have to delete the parent record and silently remove its
 * sibling readings — those ids are rejected and callers are pointed at deleteSamplesByTimeRange.
 * A stage-less sleep session keeps its bare record id (no '#') and stays deletable.
 *
 * Mirrors assertDeletableUuids in src/internal/validation.ts — keep the message strings in sync.
 */
internal fun ensureDeletableRecordIds(uuids: Array<String>): List<String> {
    if (uuids.isEmpty()) {
        throw IllegalArgumentException("At least one uuid is required")
    }

    return uuids.mapIndexed { index, uuid ->
        if (uuid.isBlank()) {
            throw IllegalArgumentException("uuids[$index]: a non-empty uuid string is required")
        }

        if (uuid.contains('#')) {
            throw IllegalArgumentException(
                "uuids[$index]: synthetic reading ids (record id + '#index') cannot be deleted" +
                    " individually; use deleteSamplesByTimeRange instead"
            )
        }

        uuid
    }
}
