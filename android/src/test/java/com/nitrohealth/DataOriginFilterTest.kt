package com.nitrohealth

import androidx.health.connect.client.records.metadata.DataOrigin
import com.margelo.nitro.nitrohealth.NativeHealthDateRangeQuery
import org.junit.Assert.assertEquals
import org.junit.Assert.assertThrows
import org.junit.Test

class DataOriginFilterTest {
    private fun makeQuery(
        ownAppOnly: Boolean? = null,
        originIdentifiers: Array<String>? = null
    ) = NativeHealthDateRangeQuery(
        startTimeMs = 1_000.0,
        endTimeMs = 2_000.0,
        limit = 100.0,
        ascending = true,
        cursor = null,
        ownAppOnly = ownAppOnly,
        originIdentifiers = originIdentifiers
    )

    @Test
    fun noFilterYieldsEmptySet() {
        assertEquals(
            emptySet<DataOrigin>(),
            makeDataOriginFilter(makeQuery()) { "com.own.app" }
        )
    }

    @Test
    fun ownAppOnlyYieldsOwnPackage() {
        assertEquals(
            setOf(DataOrigin("com.own.app")),
            makeDataOriginFilter(makeQuery(ownAppOnly = true)) { "com.own.app" }
        )
    }

    @Test
    fun identifiersYieldMappedSet() {
        assertEquals(
            setOf(DataOrigin("com.a.app"), DataOrigin("com.b.app")),
            makeDataOriginFilter(
                makeQuery(originIdentifiers = arrayOf("com.a.app", "com.b.app"))
            ) { "com.own.app" }
        )
    }

    @Test
    fun bothPresentThrows() {
        assertThrows(IllegalArgumentException::class.java) {
            makeDataOriginFilter(
                makeQuery(ownAppOnly = true, originIdentifiers = arrayOf("com.a.app"))
            ) { "com.own.app" }
        }
    }

    @Test
    fun emptyIdentifiersThrow() {
        // Health Connect treats an empty dataOriginFilter set as "no filter", so an empty
        // include list arriving natively (the JS layer forbids it) must throw rather than
        // silently widen a scoped read.
        assertThrows(IllegalArgumentException::class.java) {
            makeDataOriginFilter(makeQuery(originIdentifiers = emptyArray())) { "com.own.app" }
        }
    }
}
