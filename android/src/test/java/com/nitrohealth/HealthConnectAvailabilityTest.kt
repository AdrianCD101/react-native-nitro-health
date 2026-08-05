package com.nitrohealth

import androidx.health.connect.client.HealthConnectClient
import com.margelo.nitro.nitrohealth.NativeHealthAvailabilityReason
import com.margelo.nitro.nitrohealth.NativeHealthAvailabilityStatus
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class HealthConnectAvailabilityTest {
    @Test
    fun availableSdkReturnsAvailable() {
        val availability = makeHealthConnectAvailability(
            HealthConnectClient.SDK_AVAILABLE,
            isPlatformSupported = true
        )

        assertEquals(NativeHealthAvailabilityStatus.AVAILABLE, availability.status)
        assertNull(availability.reason)
        assertNull(availability.recovery)
    }

    @Test
    fun providerUpdateReturnsRecoverableUnavailable() {
        val availability = makeHealthConnectAvailability(
            HealthConnectClient.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED,
            isPlatformSupported = true
        )

        assertEquals(NativeHealthAvailabilityStatus.UNAVAILABLE, availability.status)
        assertEquals(
            NativeHealthAvailabilityReason.PROVIDERINSTALLORUPDATEREQUIRED,
            availability.reason
        )
        assertEquals(installOrUpdateProviderRecovery, availability.recovery)
    }

    @Test
    fun unavailableSdkDistinguishesUnsupportedPlatformFromServiceFailure() {
        assertEquals(
            NativeHealthAvailabilityReason.NOTSUPPORTED,
            makeHealthConnectAvailability(
                HealthConnectClient.SDK_UNAVAILABLE,
                isPlatformSupported = false
            ).reason
        )
        assertEquals(
            NativeHealthAvailabilityReason.SERVICEUNAVAILABLE,
            makeHealthConnectAvailability(
                HealthConnectClient.SDK_UNAVAILABLE,
                isPlatformSupported = true
            ).reason
        )
    }
}
