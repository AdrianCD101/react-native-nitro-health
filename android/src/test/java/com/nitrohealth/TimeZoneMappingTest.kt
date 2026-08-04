package com.nitrohealth

import java.time.Instant
import java.time.ZoneOffset
import org.junit.Assert.assertEquals
import org.junit.Assert.assertThrows
import org.junit.Test

class TimeZoneMappingTest {
    @Test
    fun resolvesUtcAndDaylightSavingOffsets() {
        assertEquals(ZoneOffset.UTC, resolveIanaZoneId("UTC", "workout").rules.getOffset(Instant.EPOCH))

        val newYork = resolveIanaZoneId("America/New_York", "workout")
        assertEquals(
            ZoneOffset.of("-05:00"),
            newYork.rules.getOffset(Instant.parse("2026-03-08T06:30:00Z"))
        )
        assertEquals(
            ZoneOffset.of("-04:00"),
            newYork.rules.getOffset(Instant.parse("2026-03-08T07:30:00Z"))
        )
    }

    @Test
    fun rejectsFixedOffsetsAndUnknownIdentifiers() {
        for (identifier in listOf("+01:00", "Not/A_Zone")) {
            assertThrows(IllegalArgumentException::class.java) {
                resolveIanaZoneId(identifier, "workout")
            }
        }
    }
}
