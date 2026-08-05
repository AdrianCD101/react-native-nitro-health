package com.nitrohealth

import android.content.Context
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.HealthConnectFeatures
import com.margelo.nitro.nitrohealth.NativeHealthAdditionalAccessStatus

internal fun resolveAdditionalAccessStatus(
    isFeatureAvailable: Boolean,
    isPermissionDeclared: Boolean,
    isPermissionGranted: Boolean,
    isIncluded: Boolean = false
): NativeHealthAdditionalAccessStatus {
    return when {
        isIncluded -> NativeHealthAdditionalAccessStatus.INCLUDED
        !isFeatureAvailable -> NativeHealthAdditionalAccessStatus.UNSUPPORTED
        !isPermissionDeclared -> NativeHealthAdditionalAccessStatus.NOTDECLARED
        isPermissionGranted -> NativeHealthAdditionalAccessStatus.GRANTED
        else -> NativeHealthAdditionalAccessStatus.NOTGRANTED
    }
}

internal suspend fun getAdditionalAccessStatus(
    context: Context,
    client: HealthConnectClient,
    feature: Int,
    permission: String
): NativeHealthAdditionalAccessStatus {
    return resolveAdditionalAccessStatus(
        isFeatureAvailable = client.features.getFeatureStatus(feature) ==
            HealthConnectFeatures.FEATURE_STATUS_AVAILABLE,
        isPermissionDeclared = context.hasDeclaredPermission(permission),
        isPermissionGranted = client.permissionController
            .getGrantedPermissions()
            .contains(permission)
    )
}
