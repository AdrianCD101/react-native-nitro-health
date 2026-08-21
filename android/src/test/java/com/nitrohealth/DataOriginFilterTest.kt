package com.nitrohealth

import androidx.health.connect.client.records.metadata.DataOrigin
import com.margelo.nitro.nitrohealth.NativeHealthDateRangeQuery
import org.junit.Assert.assertEquals
import org.junit.Assert.assertThrows
import org.junit.Test

class DataOriginFilterTest {
    private fun makeQuery(
        ownAppOnly: Boolean? = null,
        originIdentifiers: Array<String> = emptyArray()
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
    fun emptyIdentifiersMeanNoFilter() {
        // On the wire an empty array is the "no identifier filter" sentinel; user-supplied
        // empty arrays never reach native because the JS mapping layer rejects them.
        assertEquals(
            emptySet<DataOrigin>(),
            makeDataOriginFilter(makeQuery(originIdentifiers = emptyArray())) { "com.own.app" }
        )
    }

    @Test
    fun ownAppOnlyWithEmptyIdentifiersYieldsOwnPackage() {
        assertEquals(
            setOf(DataOrigin("com.own.app")),
            makeDataOriginFilter(
                makeQuery(ownAppOnly = true, originIdentifiers = emptyArray())
            ) { "com.own.app" }
        )
    }
}
