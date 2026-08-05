package com.nitrohealth

import androidx.health.connect.client.HealthConnectClient
import com.margelo.nitro.nitrohealth.NativeHealthAvailability
import com.margelo.nitro.nitrohealth.NativeHealthAvailabilityReason
import com.margelo.nitro.nitrohealth.NativeHealthAvailabilityStatus

internal const val installOrUpdateProviderRecovery = "installOrUpdateProvider"

internal fun makeHealthConnectAvailability(
    sdkStatus: Int,
    isPlatformSupported: Boolean
): NativeHealthAvailability {
    return when (sdkStatus) {
        HealthConnectClient.SDK_AVAILABLE -> NativeHealthAvailability(
            status = NativeHealthAvailabilityStatus.AVAILABLE,
            reason = null,
            recovery = null
        )
        HealthConnectClient.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED -> NativeHealthAvailability(
            status = NativeHealthAvailabilityStatus.UNAVAILABLE,
            reason = NativeHealthAvailabilityReason.PROVIDERINSTALLORUPDATEREQUIRED,
            recovery = installOrUpdateProviderRecovery
        )
        else -> NativeHealthAvailability(
            status = NativeHealthAvailabilityStatus.UNAVAILABLE,
            reason = if (isPlatformSupported) {
                NativeHealthAvailabilityReason.SERVICEUNAVAILABLE
            } else {
                NativeHealthAvailabilityReason.NOTSUPPORTED
            },
            recovery = null
        )
    }
}

internal fun makeUnavailableHealthConnectAvailability(): NativeHealthAvailability {
    return NativeHealthAvailability(
        status = NativeHealthAvailabilityStatus.UNAVAILABLE,
        reason = NativeHealthAvailabilityReason.SERVICEUNAVAILABLE,
        recovery = null
    )
}
