package com.nitrohealth

import com.margelo.nitro.nitrohealth.NativeDeletedCountStatus
import com.margelo.nitro.nitrohealth.NativeHealthDeleteStatus
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class DeleteResultMappingTest {
    @Test
    fun idSuccessReportsKnownRequestedCount() {
        val result = makeCompletedIdDeleteResult(3)

        assertEquals(NativeHealthDeleteStatus.COMPLETED, result.status)
        assertEquals(NativeDeletedCountStatus.KNOWN, result.deletedCountStatus)
        assertEquals(3.0, result.deletedCount ?: error("missing count"), 0.0)
    }

    @Test
    fun timeRangeSuccessHasUnverifiableCount() {
        val timeRangeResult = makeCompletedTimeRangeDeleteResult()

        assertEquals(NativeHealthDeleteStatus.COMPLETED, timeRangeResult.status)
        assertEquals(NativeDeletedCountStatus.UNVERIFIABLE, timeRangeResult.deletedCountStatus)
        assertNull(timeRangeResult.deletedCount)
    }
}
