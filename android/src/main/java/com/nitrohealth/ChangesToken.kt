package com.nitrohealth

import java.nio.ByteBuffer
import java.nio.charset.CharacterCodingException
import java.util.Base64

private const val CHANGES_TOKEN_VERSION = "v1"
private const val CHANGES_TOKEN_PLATFORM = "android"
private const val CHANGES_TOKEN_KIND = "changes"
private const val CHANGES_TOKEN_FIELD_COUNT = 5

internal fun encodeChangesToken(dataType: String, nativePayload: String): String {
    val payload = listOf(
        CHANGES_TOKEN_VERSION,
        CHANGES_TOKEN_PLATFORM,
        CHANGES_TOKEN_KIND,
        dataType,
        nativePayload
    ).joinToString("|")

    return Base64.getUrlEncoder().withoutPadding()
        .encodeToString(payload.toByteArray(Charsets.UTF_8))
}

internal fun decodeChangesToken(changesToken: String, dataType: String): String {
    val decoded = try {
        Base64.getUrlDecoder().decode(changesToken)
    } catch (_: IllegalArgumentException) {
        throw invalidChangesToken("malformed base64url envelope")
    }

    val canonicalToken = Base64.getUrlEncoder().withoutPadding().encodeToString(decoded)
    if (changesToken.isEmpty() || changesToken != canonicalToken) {
        throw invalidChangesToken("malformed base64url envelope")
    }

    val payload = try {
        Charsets.UTF_8.newDecoder().decode(ByteBuffer.wrap(decoded)).toString()
    } catch (_: CharacterCodingException) {
        throw invalidChangesToken("envelope is not valid UTF-8")
    }

    // Keep delimiters in Health Connect's opaque token as part of the final field.
    val fields = payload.split("|", limit = CHANGES_TOKEN_FIELD_COUNT)
    if (fields.size != CHANGES_TOKEN_FIELD_COUNT || fields[4].isEmpty()) {
        throw invalidChangesToken("malformed envelope")
    }
    if (fields[0] != CHANGES_TOKEN_VERSION) {
        throw invalidChangesToken("unsupported version \"${fields[0]}\"")
    }
    if (fields[1] != CHANGES_TOKEN_PLATFORM) {
        throw invalidChangesToken(
            "token was created on platform \"${fields[1]}\" and cannot be used on Android"
        )
    }
    if (fields[2] != CHANGES_TOKEN_KIND) {
        throw invalidChangesToken("expected a changes token, not kind \"${fields[2]}\"")
    }
    if (fields[3] != dataType) {
        throw invalidChangesToken("expected a token for data type '$dataType'")
    }

    return fields[4]
}

private fun invalidChangesToken(reason: String): IllegalArgumentException {
    return IllegalArgumentException("Invalid changes token: $reason")
}
