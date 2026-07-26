package com.nitrohealth

import java.util.Base64

private const val CURSOR_VERSION = "v1"
private const val CURSOR_PLATFORM = "android"
private const val CURSOR_FIELD_COUNT = 5

private fun cursorOrder(ascending: Boolean): String {
    return if (ascending) "asc" else "desc"
}

/**
 * Wraps Health Connect's opaque page token in a versioned, platform-tagged envelope so a cursor
 * handed back to JS can only be replayed against the read that produced it. The payload is
 * "v1|android|<dataType>|<asc|desc>|<hcPageToken>", base64url-encoded without padding.
 */
internal fun encodeSampleCursor(dataType: String, ascending: Boolean, pageToken: String): String {
    val payload = listOf(
        CURSOR_VERSION,
        CURSOR_PLATFORM,
        dataType,
        cursorOrder(ascending),
        pageToken
    ).joinToString("|")

    return Base64.getUrlEncoder().withoutPadding()
        .encodeToString(payload.toByteArray(Charsets.UTF_8))
}

/**
 * Unwraps a cursor produced by [encodeSampleCursor] back into the raw Health Connect page token,
 * validating that it belongs to this platform, the given data type, and the same sort order that
 * produced it. Throws [IllegalArgumentException] on any mismatch or malformed input (including
 * cursors produced by the iOS implementation, which use a different envelope).
 */
internal fun decodeSampleCursor(cursor: String, dataType: String, ascending: Boolean): String {
    val payload = try {
        String(Base64.getUrlDecoder().decode(cursor), Charsets.UTF_8)
    } catch (_: IllegalArgumentException) {
        throw IllegalArgumentException("Invalid cursor: not a cursor produced by a previous read")
    }

    // limit = CURSOR_FIELD_COUNT keeps a Health Connect page token containing '|' intact.
    val fields = payload.split("|", limit = CURSOR_FIELD_COUNT)
    if (fields.size != CURSOR_FIELD_COUNT) {
        throw IllegalArgumentException(
            "Invalid cursor: not an Android cursor for '$dataType' reads" +
                " (cursors cannot be reused across platforms)"
        )
    }
    if (fields[0] != CURSOR_VERSION) {
        throw IllegalArgumentException(
            "Invalid cursor: unsupported cursor version \"${fields[0]}\""
        )
    }
    if (fields[1] != CURSOR_PLATFORM) {
        throw IllegalArgumentException(
            "Invalid cursor: cursor was created on platform \"${fields[1]}\" and cannot be" +
                " used for Android reads"
        )
    }
    if (fields[2] != dataType) {
        throw IllegalArgumentException(
            "Invalid cursor: expected a cursor for '$dataType' reads"
        )
    }
    if (fields[3] != cursorOrder(ascending)) {
        throw IllegalArgumentException(
            "Invalid cursor: cursor must be used with the same ascending option that produced it"
        )
    }

    return fields[4]
}
