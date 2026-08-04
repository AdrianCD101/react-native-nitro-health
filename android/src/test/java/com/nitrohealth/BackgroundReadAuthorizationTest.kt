package com.nitrohealth

import com.margelo.nitro.nitrohealth.BackgroundReadAuthorizationStatus
import org.junit.Assert.assertEquals
import org.junit.Test

class BackgroundReadAuthorizationTest {
    @Test
    fun unavailableFeatureReturnsUnavailable() {
        assertEquals(
            BackgroundReadAuthorizationStatus.UNAVAILABLE,
            resolveBackgroundReadAuthorizationStatus(
                isFeatureAvailable = false,
                isPermissionDeclared = true,
                isPermissionGranted = true
            )
        )
    }

    @Test
    fun missingManifestPermissionReturnsNotDeclared() {
        assertEquals(
            BackgroundReadAuthorizationStatus.NOTDECLARED,
            resolveBackgroundReadAuthorizationStatus(
                isFeatureAvailable = true,
                isPermissionDeclared = false,
                isPermissionGranted = false
            )
        )
    }

    @Test
    fun missingGrantReturnsNotGranted() {
        assertEquals(
            BackgroundReadAuthorizationStatus.NOTGRANTED,
            resolveBackgroundReadAuthorizationStatus(
                isFeatureAvailable = true,
                isPermissionDeclared = true,
                isPermissionGranted = false
            )
        )
    }

    @Test
    fun grantedPermissionReturnsGranted() {
        assertEquals(
            BackgroundReadAuthorizationStatus.GRANTED,
            resolveBackgroundReadAuthorizationStatus(
                isFeatureAvailable = true,
                isPermissionDeclared = true,
                isPermissionGranted = true
            )
        )
    }
}
