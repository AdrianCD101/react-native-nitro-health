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
        // Session envelopes expose their parent record id and remain deletable.
        val recordIds = ensureDeletableRecordIds(arrayOf("3f2b9c1e-7a54-4f0d-9e2a-1c8d5b6e4a30"))

        assertEquals(listOf("3f2b9c1e-7a54-4f0d-9e2a-1c8d5b6e4a30"), recordIds)
    }

    @Test
    fun rejectsSyntheticReadingId() {
        val error = assertThrows(IllegalArgumentException::class.java) {
            ensureDeletableRecordIds(arrayOf("3f2b9c1e-7a54-4f0d-9e2a-1c8d5b6e4a30#0"))
        }

        assertEquals(
            "recordIds[0]: synthetic child ids (record id + '#index') cannot be deleted;" +
                " pass the parent record id instead",
            error.message
        )
    }

    @Test
    fun reportsFailingIndex() {
        val error = assertThrows(IllegalArgumentException::class.java) {
            ensureDeletableRecordIds(arrayOf("3f2b9c1e-7a54-4f0d-9e2a-1c8d5b6e4a30", "rec#4"))
        }

        assertEquals(
            "recordIds[1]: synthetic child ids (record id + '#index') cannot be deleted;" +
                " pass the parent record id instead",
            error.message
        )
    }

    @Test
    fun rejectsEmptyArray() {
        val error = assertThrows(IllegalArgumentException::class.java) {
            ensureDeletableRecordIds(emptyArray())
        }

        assertEquals("At least one record id is required", error.message)
    }

    @Test
    fun rejectsBlankRecordId() {
        val error = assertThrows(IllegalArgumentException::class.java) {
            ensureDeletableRecordIds(arrayOf(" "))
        }

        assertEquals("recordIds[0]: a non-empty record id string is required", error.message)
    }
}
