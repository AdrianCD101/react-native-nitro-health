package com.nitrohealth

/**
 * Validates record ids passed to deleteRecordsByIds and returns them as the list Health Connect
 * expects.
 *
 * readHeartRate and readSleepSamples flatten series/session records into individual readings
 * under synthetic "<recordId>#<index>" ids. Health Connect can only delete whole records, so
 * deleting by a synthetic id would have to delete the parent record and silently remove its
 * sibling readings, so those ids are rejected.
 * Session envelopes keep the bare parent record id and remain deletable.
 */
internal fun ensureDeletableRecordIds(recordIds: Array<String>): List<String> {
    if (recordIds.isEmpty()) {
        throw IllegalArgumentException("At least one record id is required")
    }

    return recordIds.mapIndexed { index, recordId ->
        if (recordId.isBlank()) {
            throw IllegalArgumentException(
                "recordIds[$index]: a non-empty record id string is required"
            )
        }

        if (recordId.contains('#')) {
            throw IllegalArgumentException(
                "recordIds[$index]: synthetic child ids (record id + '#index') cannot be deleted;" +
                    " pass the parent record id instead"
            )
        }

        recordId
    }
}
