package com.nitrohealth

import java.util.Base64
import org.junit.Assert.assertEquals
import org.junit.Assert.assertThrows
import org.junit.Test

class SampleCursorTest {
    @Test
    fun encodeDecodeRoundTripsAscending() {
        val cursor = encodeSampleCursor("steps", true, "hc-token-123")

        assertEquals("hc-token-123", decodeSampleCursor(cursor, "steps", true))
    }

    @Test
    fun encodeDecodeRoundTripsDescending() {
        val cursor = encodeSampleCursor("heartRate", false, "hc-token-456")

        assertEquals("hc-token-456", decodeSampleCursor(cursor, "heartRate", false))
    }

    @Test
    fun pageTokenContainingPipesSurvivesRoundTrip() {
        val pageToken = "part|with|pipes|inside"
        val cursor = encodeSampleCursor("sleep", true, pageToken)

        assertEquals(pageToken, decodeSampleCursor(cursor, "sleep", true))
    }

    @Test
    fun emptyPageTokenRoundTrips() {
        val cursor = encodeSampleCursor("workout", false, "")

        assertEquals("", decodeSampleCursor(cursor, "workout", false))
    }

    @Test
    fun decodeRejectsGarbageString() {
        val error = assertThrows(IllegalArgumentException::class.java) {
            decodeSampleCursor("not base64!!", "steps", true)
        }

        assertEquals("Invalid cursor: not a cursor produced by a previous read", error.message)
    }

    @Test
    fun decodeRejectsBase64WithoutCursorStructure() {
        val cursor = Base64.getUrlEncoder().withoutPadding()
            .encodeToString("just some text".toByteArray(Charsets.UTF_8))

        val error = assertThrows(IllegalArgumentException::class.java) {
            decodeSampleCursor(cursor, "steps", true)
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
            decodeSampleCursor(cursor, "steps", true)
        }

        assertEquals(
            "Invalid cursor: not an Android cursor for 'steps' reads" +
                " (cursors cannot be reused across platforms)",
            error.message
        )
    }

    @Test
    fun decodeRejectsUnsupportedVersion() {
        val cursor = Base64.getUrlEncoder().withoutPadding()
            .encodeToString("v2|android|steps|asc|token".toByteArray(Charsets.UTF_8))

        val error = assertThrows(IllegalArgumentException::class.java) {
            decodeSampleCursor(cursor, "steps", true)
        }

        assertEquals("Invalid cursor: unsupported cursor version \"v2\"", error.message)
    }

    @Test
    fun decodeRejectsOtherPlatform() {
        val cursor = Base64.getUrlEncoder().withoutPadding()
            .encodeToString("v1|ios|steps|asc|token".toByteArray(Charsets.UTF_8))

        val error = assertThrows(IllegalArgumentException::class.java) {
            decodeSampleCursor(cursor, "steps", true)
        }

        assertEquals(
            "Invalid cursor: cursor was created on platform \"ios\" and cannot be" +
                " used for Android reads",
            error.message
        )
    }

    @Test
    fun decodeRejectsDataTypeMismatch() {
        val cursor = encodeSampleCursor("steps", true, "hc-token-123")

        val error = assertThrows(IllegalArgumentException::class.java) {
            decodeSampleCursor(cursor, "heartRate", true)
        }

        assertEquals("Invalid cursor: expected a cursor for 'heartRate' reads", error.message)
    }

    @Test
    fun decodeRejectsAscendingMismatch() {
        val cursor = encodeSampleCursor("steps", true, "hc-token-123")

        val error = assertThrows(IllegalArgumentException::class.java) {
            decodeSampleCursor(cursor, "steps", false)
        }

        assertEquals(
            "Invalid cursor: cursor must be used with the same ascending option that produced it",
            error.message
        )
    }
}
