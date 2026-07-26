package com.nitrohealth

import org.junit.Assert.assertEquals
import org.junit.Assert.assertThrows
import org.junit.Test

class DeleteRecordIdValidationTest {
    @Test
    fun passesThroughPlainRecordIds() {
        val recordIds = ensureDeletableRecordIds(
            arrayOf("3f2b9c1e-7a54-4f0d-9e2a-1c8d5b6e4a30", "b4a1d2c3-0f9e-4b8a-a7c6-d5e4f3a2b1c0")
        )

        assertEquals(
            listOf("3f2b9c1e-7a54-4f0d-9e2a-1c8d5b6e4a30", "b4a1d2c3-0f9e-4b8a-a7c6-d5e4f3a2b1c0"),
            recordIds
        )
    }

    @Test
    fun acceptsBareSleepSessionRecordId() {
        // A sleep session with zero stages is surfaced under its bare record id (no '#index'),
        // so it must stay deletable by uuid.
        val recordIds = ensureDeletableRecordIds(arrayOf("3f2b9c1e-7a54-4f0d-9e2a-1c8d5b6e4a30"))

        assertEquals(listOf("3f2b9c1e-7a54-4f0d-9e2a-1c8d5b6e4a30"), recordIds)
    }

    @Test
    fun rejectsSyntheticReadingId() {
        val error = assertThrows(IllegalArgumentException::class.java) {
            ensureDeletableRecordIds(arrayOf("3f2b9c1e-7a54-4f0d-9e2a-1c8d5b6e4a30#0"))
        }

        assertEquals(
            "uuids[0]: synthetic reading ids (record id + '#index') cannot be deleted" +
                " individually; use deleteSamplesByTimeRange instead",
            error.message
        )
    }

    @Test
    fun reportsFailingIndex() {
        val error = assertThrows(IllegalArgumentException::class.java) {
            ensureDeletableRecordIds(arrayOf("3f2b9c1e-7a54-4f0d-9e2a-1c8d5b6e4a30", "rec#4"))
        }

        assertEquals(
            "uuids[1]: synthetic reading ids (record id + '#index') cannot be deleted" +
                " individually; use deleteSamplesByTimeRange instead",
            error.message
        )
    }

    @Test
    fun rejectsEmptyArray() {
        val error = assertThrows(IllegalArgumentException::class.java) {
            ensureDeletableRecordIds(emptyArray())
        }

        assertEquals("At least one uuid is required", error.message)
    }

    @Test
    fun rejectsBlankUuid() {
        val error = assertThrows(IllegalArgumentException::class.java) {
            ensureDeletableRecordIds(arrayOf(" "))
        }

        assertEquals("uuids[0]: a non-empty uuid string is required", error.message)
    }
}
