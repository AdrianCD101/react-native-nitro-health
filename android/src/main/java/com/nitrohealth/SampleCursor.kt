package com.nitrohealth

import com.margelo.nitro.nitrohealth.NativeHealthDateRangeQuery
import java.util.Base64

// v2 added the origins-filter field. v1 cursors are rejected as an unsupported version:
// the envelope is positional, so older cursors cannot be reinterpreted safely, and the
// documented cursor contract ("short-lived, do not persist") licenses loud invalidation
// across a library upgrade. (iOS cursors are Codable JSON with optional fields, so the
// iOS envelope stays at version 1 — the asymmetry is deliberate.)
private const val CURSOR_VERSION = "v2"
private const val CURSOR_PLATFORM = "android"
private const val CURSOR_FIELD_COUNT = 8

private const val ORIGINS_OWN_APP = "own-app"
private const val ORIGINS_IDENTIFIERS_PREFIX = "ids:"

private fun cursorOrder(ascending: Boolean): String {
    return if (ascending) "asc" else "desc"
}

// Canonical origins-filter field for the envelope: "" when unfiltered, "own-app", or
// "ids:" + base64url of the newline-joined identifier list. The base64url alphabet
// contains no '|', so identifier content can never break the positional envelope. The
// identifiers arrive canonical (sorted, deduped) from the JS layer — the native side
// trusts that, so byte equality of this field is set equality of the filter.
private fun cursorOriginsField(query: NativeHealthDateRangeQuery): String {
    if (query.ownAppOnly == true) {
        return ORIGINS_OWN_APP
    }

    val identifiers = query.originIdentifiers ?: return ""

    return ORIGINS_IDENTIFIERS_PREFIX + Base64.getUrlEncoder().withoutPadding()
        .encodeToString(identifiers.joinToString("\n").toByteArray(Charsets.UTF_8))
}

/**
 * Wraps Health Connect's opaque page token in a versioned, platform-tagged envelope so a cursor
 * handed back to JS can only be replayed against the read that produced it. The payload is
 * "v2|android|<dataType>|<asc|desc>|<startTimeMs>|<endTimeMs>|<origins>|<hcPageToken>",
 * base64url-encoded without padding. The page token stays last so splitting with a field limit
 * keeps any '|' inside it intact.
 */
internal fun encodeSampleCursor(
    dataType: String,
    query: NativeHealthDateRangeQuery,
    pageToken: String
): String {
    val payload = listOf(
        CURSOR_VERSION,
        CURSOR_PLATFORM,
        dataType,
        cursorOrder(query.ascending),
        query.startTimeMs.toLong(),
        query.endTimeMs.toLong(),
        cursorOriginsField(query),
        pageToken
    ).joinToString("|")

    return Base64.getUrlEncoder().withoutPadding()
        .encodeToString(payload.toByteArray(Charsets.UTF_8))
}

/**
 * Unwraps a cursor produced by [encodeSampleCursor] back into the raw Health Connect page token,
 * validating that it belongs to this platform, data type, sort order, date range, and origins
 * filter. Throws [IllegalArgumentException] on any mismatch or malformed input (including
 * cursors produced by the iOS implementation, which use a different envelope, and v1 cursors
 * produced before origin filtering existed).
 */
internal fun decodeSampleCursor(
    cursor: String,
    dataType: String,
    query: NativeHealthDateRangeQuery
): String {
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
    if (fields[3] != cursorOrder(query.ascending)) {
        throw IllegalArgumentException(
            "Invalid cursor: cursor must be used with the same ascending option that produced it"
        )
    }
    if (
        fields[4].toLongOrNull() != query.startTimeMs.toLong() ||
        fields[5].toLongOrNull() != query.endTimeMs.toLong()
    ) {
        throw IllegalArgumentException(
            "Invalid cursor: cursor must be used with the same date range that produced it"
        )
    }
    if (fields[6] != cursorOriginsField(query)) {
        throw IllegalArgumentException(
            "Invalid cursor: cursor must be used with the same origins filter that produced it"
        )
    }

    return fields[7]
}
