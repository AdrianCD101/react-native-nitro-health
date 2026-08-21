package com.nitrohealth

import com.margelo.nitro.nitrohealth.NativeHealthDateRangeQuery
import java.util.Base64
import org.junit.Assert.assertEquals
import org.junit.Assert.assertThrows
import org.junit.Test

class SampleCursorTest {
    private fun makeQuery(
        startTimeMs: Double = 1_000.0,
        endTimeMs: Double = 2_000.0,
        ascending: Boolean = true,
        ownAppOnly: Boolean? = null,
        originIdentifiers: Array<String>? = null
    ) = NativeHealthDateRangeQuery(
        startTimeMs = startTimeMs,
        endTimeMs = endTimeMs,
        limit = 100.0,
        ascending = ascending,
        cursor = null,
        ownAppOnly = ownAppOnly,
        originIdentifiers = originIdentifiers
    )

    @Test
    fun encodeDecodeRoundTripsAscending() {
        val query = makeQuery()
        val cursor = encodeSampleCursor("steps", query, "hc-token-123")

        assertEquals("hc-token-123", decodeSampleCursor(cursor, "steps", query))
    }

    @Test
    fun encodeDecodeRoundTripsDescending() {
        val query = makeQuery(ascending = false)
        val cursor = encodeSampleCursor("heartRate", query, "hc-token-456")

        assertEquals("hc-token-456", decodeSampleCursor(cursor, "heartRate", query))
    }

    @Test
    fun pageTokenContainingPipesSurvivesRoundTrip() {
        val pageToken = "part|with|pipes|inside"
        val query = makeQuery()
        val cursor = encodeSampleCursor("sleep", query, pageToken)

        assertEquals(pageToken, decodeSampleCursor(cursor, "sleep", query))
    }

    @Test
    fun emptyPageTokenRoundTrips() {
        val query = makeQuery(ascending = false)
        val cursor = encodeSampleCursor("workout", query, "")

        assertEquals("", decodeSampleCursor(cursor, "workout", query))
    }

    @Test
    fun decodeRejectsGarbageString() {
        val error = assertThrows(IllegalArgumentException::class.java) {
            decodeSampleCursor("not base64!!", "steps", makeQuery())
        }

        assertEquals("Invalid cursor: not a cursor produced by a previous read", error.message)
    }

    @Test
    fun decodeRejectsBase64WithoutCursorStructure() {
        val cursor = Base64.getUrlEncoder().withoutPadding()
            .encodeToString("just some text".toByteArray(Charsets.UTF_8))

        val error = assertThrows(IllegalArgumentException::class.java) {
            decodeSampleCursor(cursor, "steps", makeQuery())
        }

        assertEquals(
            "Invalid cursor: not an Android cursor for 'steps' reads" +
                " (cursors cannot be reused across platforms)",
            error.message
        )
    }

    @Test
    fun decodeRejectsIosStyleCursor() {
        // iOS cursors are base64url-encoded JSON, so they decode as base64 but fail the
        // pipe-delimited structure check.
        val iosPayload = """{"version":1,"platform":"ios","dataType":"steps","anchor":"abc"}"""
        val cursor = Base64.getUrlEncoder().withoutPadding()
            .encodeToString(iosPayload.toByteArray(Charsets.UTF_8))

        val error = assertThrows(IllegalArgumentException::class.java) {
            decodeSampleCursor(cursor, "steps", makeQuery())
        }

        assertEquals(
            "Invalid cursor: not an Android cursor for 'steps' reads" +
                " (cursors cannot be reused across platforms)",
            error.message
        )
    }

    @Test
    fun decodeRejectsLegacyV1Envelope() {
        // A v1 cursor (pre origin filtering) has 7 fields, so it fails the structure
        // check before the version check. Cursors are documented as short-lived, so a
        // library upgrade invalidating them loudly is the designed recovery.
        val cursor = Base64.getUrlEncoder().withoutPadding()
            .encodeToString("v1|android|steps|asc|1000|2000|token".toByteArray(Charsets.UTF_8))

        assertThrows(IllegalArgumentException::class.java) {
            decodeSampleCursor(cursor, "steps", makeQuery())
        }
    }

    @Test
    fun decodeRejectsUnsupportedVersion() {
        val cursor = Base64.getUrlEncoder().withoutPadding()
            .encodeToString("v3|android|steps|asc|1000|2000||token".toByteArray(Charsets.UTF_8))

        val error = assertThrows(IllegalArgumentException::class.java) {
            decodeSampleCursor(cursor, "steps", makeQuery())
        }

        assertEquals("Invalid cursor: unsupported cursor version \"v3\"", error.message)
    }

    @Test
    fun decodeRejectsOtherPlatform() {
        val cursor = Base64.getUrlEncoder().withoutPadding()
            .encodeToString("v2|ios|steps|asc|1000|2000||token".toByteArray(Charsets.UTF_8))

        val error = assertThrows(IllegalArgumentException::class.java) {
            decodeSampleCursor(cursor, "steps", makeQuery())
        }

        assertEquals(
            "Invalid cursor: cursor was created on platform \"ios\" and cannot be" +
                " used for Android reads",
            error.message
        )
    }

    @Test
    fun decodeRejectsDataTypeMismatch() {
        val query = makeQuery()
        val cursor = encodeSampleCursor("steps", query, "hc-token-123")

        val error = assertThrows(IllegalArgumentException::class.java) {
            decodeSampleCursor(cursor, "heartRate", query)
        }

        assertEquals("Invalid cursor: expected a cursor for 'heartRate' reads", error.message)
    }

    @Test
    fun decodeRejectsAscendingMismatch() {
        val cursor = encodeSampleCursor("steps", makeQuery(), "hc-token-123")

        val error = assertThrows(IllegalArgumentException::class.java) {
            decodeSampleCursor(cursor, "steps", makeQuery(ascending = false))
        }

        assertEquals(
            "Invalid cursor: cursor must be used with the same ascending option that produced it",
            error.message
        )
    }

    @Test
    fun decodeRejectsStartTimeMismatch() {
        val cursor = encodeSampleCursor("steps", makeQuery(), "hc-token-123")

        val error = assertThrows(IllegalArgumentException::class.java) {
            decodeSampleCursor(cursor, "steps", makeQuery(startTimeMs = 999.0))
        }

        assertEquals(
            "Invalid cursor: cursor must be used with the same date range that produced it",
            error.message
        )
    }

    @Test
    fun decodeRejectsEndTimeMismatch() {
        val cursor = encodeSampleCursor("steps", makeQuery(), "hc-token-123")

        val error = assertThrows(IllegalArgumentException::class.java) {
            decodeSampleCursor(cursor, "steps", makeQuery(endTimeMs = 2_001.0))
        }

        assertEquals(
            "Invalid cursor: cursor must be used with the same date range that produced it",
            error.message
        )
    }

    @Test
    fun originsOwnAppRoundTrips() {
        val query = makeQuery(ownAppOnly = true)
        val cursor = encodeSampleCursor("steps", query, "hc-token-123")

        assertEquals("hc-token-123", decodeSampleCursor(cursor, "steps", query))
    }

    @Test
    fun originsIdentifiersRoundTrip() {
        val query = makeQuery(originIdentifiers = arrayOf("com.a.app", "com.b.app"))
        val cursor = encodeSampleCursor("steps", query, "hc-token-123")

        assertEquals("hc-token-123", decodeSampleCursor(cursor, "steps", query))
    }

    @Test
    fun originsIdentifiersContainingDelimitersRoundTrip() {
        // Identifier content is base64url-wrapped inside the envelope, so characters
        // that collide with the envelope or the joiner can never break the structure.
        val query = makeQuery(originIdentifiers = arrayOf("com.a|pp", "com.b\napp"))
        val cursor = encodeSampleCursor("sleep", query, "part|with|pipes")

        assertEquals("part|with|pipes", decodeSampleCursor(cursor, "sleep", query))
    }

    @Test
    fun decodeRejectsUnfilteredCursorForFilteredQuery() {
        val cursor = encodeSampleCursor("steps", makeQuery(), "hc-token-123")

        val error = assertThrows(IllegalArgumentException::class.java) {
            decodeSampleCursor(cursor, "steps", makeQuery(ownAppOnly = true))
        }

        assertEquals(
            "Invalid cursor: cursor must be used with the same origins filter that produced it",
            error.message
        )
    }

    @Test
    fun decodeRejectsFilteredCursorForUnfilteredQuery() {
        val cursor = encodeSampleCursor(
            "steps",
            makeQuery(originIdentifiers = arrayOf("com.a.app")),
            "hc-token-123"
        )

        val error = assertThrows(IllegalArgumentException::class.java) {
            decodeSampleCursor(cursor, "steps", makeQuery())
        }

        assertEquals(
            "Invalid cursor: cursor must be used with the same origins filter that produced it",
            error.message
        )
    }

    @Test
    fun decodeRejectsOwnAppCursorForIdentifiersQuery() {
        val cursor = encodeSampleCursor("steps", makeQuery(ownAppOnly = true), "hc-token-123")

        val error = assertThrows(IllegalArgumentException::class.java) {
            decodeSampleCursor(
                cursor,
                "steps",
                makeQuery(originIdentifiers = arrayOf("com.a.app"))
            )
        }

        assertEquals(
            "Invalid cursor: cursor must be used with the same origins filter that produced it",
            error.message
        )
    }

    @Test
    fun decodeRejectsDifferentIdentifierSets() {
        val cursor = encodeSampleCursor(
            "steps",
            makeQuery(originIdentifiers = arrayOf("com.a.app", "com.b.app")),
            "hc-token-123"
        )

        val error = assertThrows(IllegalArgumentException::class.java) {
            decodeSampleCursor(
                cursor,
                "steps",
                makeQuery(originIdentifiers = arrayOf("com.a.app"))
            )
        }

        assertEquals(
            "Invalid cursor: cursor must be used with the same origins filter that produced it",
            error.message
        )
    }
}
