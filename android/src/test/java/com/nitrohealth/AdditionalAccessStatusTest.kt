package com.nitrohealth

import com.margelo.nitro.nitrohealth.NativeHealthAdditionalAccessStatus
import org.junit.Assert.assertEquals
import org.junit.Test

class AdditionalAccessStatusTest {
    @Test
    fun includedAccessTakesPrecedence() {
        assertEquals(
            NativeHealthAdditionalAccessStatus.INCLUDED,
            resolveAdditionalAccessStatus(
                isIncluded = true,
                isFeatureAvailable = false,
                isPermissionDeclared = false,
                isPermissionGranted = false
            )
        )
    }

    @Test
    fun unsupportedFeatureReturnsUnsupported() {
        assertEquals(
            NativeHealthAdditionalAccessStatus.UNSUPPORTED,
            resolveAdditionalAccessStatus(
                isFeatureAvailable = false,
                isPermissionDeclared = true,
                isPermissionGranted = true
            )
        )
    }

    @Test
    fun declaredAndGrantStatesResolveForBackgroundAndHistoryAccess() {
        assertEquals(
            NativeHealthAdditionalAccessStatus.NOTDECLARED,
            resolveAdditionalAccessStatus(
                isFeatureAvailable = true,
                isPermissionDeclared = false,
                isPermissionGranted = false
            )
        )
        assertEquals(
            NativeHealthAdditionalAccessStatus.NOTGRANTED,
            resolveAdditionalAccessStatus(
                isFeatureAvailable = true,
                isPermissionDeclared = true,
                isPermissionGranted = false
            )
        )
        assertEquals(
            NativeHealthAdditionalAccessStatus.GRANTED,
            resolveAdditionalAccessStatus(
                isFeatureAvailable = true,
                isPermissionDeclared = true,
                isPermissionGranted = true
            )
        )
    }
}
