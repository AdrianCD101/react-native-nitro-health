package com.nitrohealth

import java.time.DateTimeException
import java.time.Instant
import java.time.ZoneId
import java.time.ZoneOffset

// ZoneOffset.getId() renders UTC as "Z"; the portable contract is always "+HH:MM".
internal fun formatZoneOffset(offset: ZoneOffset?): String? {
    val id = offset?.id ?: return null
    return if (id == "Z") "+00:00" else id
}

// Resolves the write-input zone (device zone when omitted) to the offset at one instant,
// so an interval record crossing a DST shift gets differing start and end offsets.
internal fun writeZoneOffset(timeZone: String?, timeMs: Double): ZoneOffset {
    return resolveIanaZoneId(timeZone, "samples")
        .rules
        .getOffset(Instant.ofEpochMilli(timeMs.toLong()))
}

internal fun resolveIanaZoneId(identifier: String?, errorPrefix: String): ZoneId {
    if (identifier == null) return ZoneId.systemDefault()

    if (identifier != "UTC" && identifier !in ZoneId.getAvailableZoneIds()) {
        throw IllegalArgumentException(
            "$errorPrefix: timeZone is not a valid IANA time-zone identifier: $identifier"
        )
    }

    return try {
        ZoneId.of(identifier)
    } catch (error: DateTimeException) {
        throw IllegalArgumentException(
            "$errorPrefix: timeZone is not a valid IANA time-zone identifier: $identifier",
            error
        )
    }
}
