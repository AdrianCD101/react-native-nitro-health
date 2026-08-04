package com.nitrohealth

import java.time.DateTimeException
import java.time.ZoneId

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
