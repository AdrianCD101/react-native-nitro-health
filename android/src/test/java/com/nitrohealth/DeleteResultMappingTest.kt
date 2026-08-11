package com.nitrohealth

import com.margelo.nitro.nitrohealth.NativeDeletedCountStatus
import com.margelo.nitro.nitrohealth.NativeHealthDeleteStatus
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class DeleteResultMappingTest {
    @Test
    fun idSuccessHasUnverifiableCount() {
        val result = makeCompletedIdDeleteResult()

        assertEquals(NativeHealthDeleteStatus.COMPLETED, result.status)
        assertEquals(NativeDeletedCountStatus.UNVERIFIABLE, result.deletedCountStatus)
        assertNull(result.deletedCount)
    }

    @Test
    fun timeRangeSuccessHasUnverifiableCount() {
        val timeRangeResult = makeCompletedTimeRangeDeleteResult()

        assertEquals(NativeHealthDeleteStatus.COMPLETED, timeRangeResult.status)
        assertEquals(NativeDeletedCountStatus.UNVERIFIABLE, timeRangeResult.deletedCountStatus)
        assertNull(timeRangeResult.deletedCount)
    }
}
