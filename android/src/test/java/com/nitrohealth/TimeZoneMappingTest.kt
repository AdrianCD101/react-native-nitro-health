package com.nitrohealth

import java.time.Instant
import java.time.ZoneOffset
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
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

    @Test
    fun formatsZoneOffsetsPortablyIncludingUtcAndHalfHourZones() {
        assertEquals("+00:00", formatZoneOffset(ZoneOffset.UTC))
        assertEquals("+09:00", formatZoneOffset(ZoneOffset.of("+09:00")))
        assertEquals("-05:00", formatZoneOffset(ZoneOffset.of("-05:00")))
        assertEquals("+05:30", formatZoneOffset(ZoneOffset.of("+05:30")))
        assertNull(formatZoneOffset(null))
    }

    @Test
    fun writeZoneOffsetResolvesPerInstantAndRejectsInvalidZones() {
        val springForwardStartMs = Instant.parse("2026-03-08T06:30:00Z").toEpochMilli().toDouble()
        val springForwardEndMs = Instant.parse("2026-03-08T07:30:00Z").toEpochMilli().toDouble()

        assertEquals(
            ZoneOffset.of("-05:00"),
            writeZoneOffset("America/New_York", springForwardStartMs)
        )
        assertEquals(
            ZoneOffset.of("-04:00"),
            writeZoneOffset("America/New_York", springForwardEndMs)
        )
        assertThrows(IllegalArgumentException::class.java) {
            writeZoneOffset("Not/A_Zone", springForwardStartMs)
        }
    }
}
