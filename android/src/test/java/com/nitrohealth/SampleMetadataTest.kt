package com.nitrohealth

import androidx.health.connect.client.records.metadata.Metadata
import org.junit.Assert.assertEquals
import org.junit.Assert.assertThrows
import org.junit.Test

class SampleMetadataTest {
    @Test
    fun rejectsSyncIdWithoutVersion() {
        val error = assertThrows(IllegalArgumentException::class.java) {
            makeSampleMetadata(syncId = "sample-sync-id", syncVersion = null)
        }

        assertEquals(
            "syncId and syncVersion must either both be provided or both be absent",
            error.message
        )
    }

    @Test
    fun rejectsSyncVersionWithoutId() {
        val error = assertThrows(IllegalArgumentException::class.java) {
            makeSampleMetadata(syncId = null, syncVersion = 1.0)
        }

        assertEquals(
            "syncId and syncVersion must either both be provided or both be absent",
            error.message
        )
    }

    @Test
    fun rejectsBlankSyncId() {
        val error = assertThrows(IllegalArgumentException::class.java) {
            makeSampleMetadata(syncId = "  ", syncVersion = 1.0)
        }

        assertEquals("syncId must be a non-empty string", error.message)
    }

    @Test
    fun rejectsInvalidSyncVersionsBeforeLongConversion() {
        val invalidVersions = listOf(
            -1.0,
            1.5,
            Double.NaN,
            Double.POSITIVE_INFINITY,
            9_007_199_254_740_992.0
        )

        invalidVersions.forEach { syncVersion ->
            val error = assertThrows(IllegalArgumentException::class.java) {
                makeSampleMetadata(syncId = "sample-sync-id", syncVersion = syncVersion)
            }

            assertEquals("syncVersion must be a non-negative safe integer", error.message)
        }
    }

    @Test
    fun acceptsMaximumSafeIntegerVersion() {
        val metadata = makeSampleMetadata(
            syncId = "sample-sync-id",
            syncVersion = 9_007_199_254_740_991.0
        )

        assertEquals("sample-sync-id", metadata.clientRecordId)
        assertEquals(9_007_199_254_740_991L, metadata.clientRecordVersion)
        assertEquals(Metadata.RECORDING_METHOD_UNKNOWN, metadata.recordingMethod)
    }
}
