package com.nitrohealth

import com.margelo.nitro.nitrohealth.NativeHealthDateRangeQuery
import java.util.Base64
import org.junit.Assert.assertEquals
import org.junit.Assert.assertThrows
import org.junit.Test

class ChangesTokenTest {
    @Test
    fun encodeDecodeRoundTripsOpaquePayload() {
        val token = encodeChangesToken("steps", "native|token|with|pipes")

        assertEquals("native|token|with|pipes", decodeChangesToken(token, "steps"))
    }

    @Test
    fun decodeRejectsMalformedToken() {
        val error = assertThrows(IllegalArgumentException::class.java) {
            decodeChangesToken("not a token!", "steps")
        }

        assertEquals("Invalid changes token: malformed base64url envelope", error.message)
    }

    @Test
    fun decodeRejectsUnsupportedVersion() {
        val token = encodeEnvelope("v2|android|changes|steps|native-token")

        val error = assertThrows(IllegalArgumentException::class.java) {
            decodeChangesToken(token, "steps")
        }

        assertEquals("Invalid changes token: unsupported version \"v2\"", error.message)
    }

    @Test
    fun decodeRejectsForeignPlatform() {
        val token = encodeEnvelope("v1|ios|changes|steps|native-token")

        val error = assertThrows(IllegalArgumentException::class.java) {
            decodeChangesToken(token, "steps")
        }

        assertEquals(
            "Invalid changes token: token was created on platform \"ios\" and cannot be used on Android",
            error.message
        )
    }

    @Test
    fun decodeRejectsPaginationCursorKind() {
        val cursor = encodeSampleCursor(
            "steps",
            NativeHealthDateRangeQuery(
                startTimeMs = 1_000.0,
                endTimeMs = 2_000.0,
                limit = 100.0,
                ascending = true,
                cursor = null,
                ownAppOnly = null,
                originIdentifiers = emptyArray()
            ),
            "page-token"
        )

        val error = assertThrows(IllegalArgumentException::class.java) {
            decodeChangesToken(cursor, "steps")
        }

        // Sample cursors moved to a v2 envelope for origin filtering, so the changes-token
        // decoder now rejects them at its version check rather than the kind check.
        assertEquals("Invalid changes token: unsupported version \"v2\"", error.message)
    }

    @Test
    fun decodeRejectsDataTypeMismatch() {
        val token = encodeChangesToken("steps", "native-token")

        val error = assertThrows(IllegalArgumentException::class.java) {
            decodeChangesToken(token, "heartRate")
        }

        assertEquals("Invalid changes token: expected a token for data type 'heartRate'", error.message)
    }

    private fun encodeEnvelope(value: String): String {
        return Base64.getUrlEncoder().withoutPadding()
            .encodeToString(value.toByteArray(Charsets.UTF_8))
    }
}
