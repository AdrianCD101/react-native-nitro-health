package com.nitrohealth

import android.content.Context
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.HealthConnectFeatures
import androidx.health.connect.client.permission.HealthPermission
import com.margelo.nitro.nitrohealth.BackgroundReadAuthorizationStatus

internal val backgroundReadPermission: String =
    HealthPermission.PERMISSION_READ_HEALTH_DATA_IN_BACKGROUND

internal fun resolveBackgroundReadAuthorizationStatus(
    isFeatureAvailable: Boolean,
    isPermissionDeclared: Boolean,
    isPermissionGranted: Boolean
): BackgroundReadAuthorizationStatus {
    return when {
        !isFeatureAvailable -> BackgroundReadAuthorizationStatus.UNAVAILABLE
        !isPermissionDeclared -> BackgroundReadAuthorizationStatus.NOTDECLARED
        isPermissionGranted -> BackgroundReadAuthorizationStatus.GRANTED
        else -> BackgroundReadAuthorizationStatus.NOTGRANTED
    }
}

internal suspend fun getBackgroundReadAuthorizationStatus(
    context: Context,
    client: HealthConnectClient
): BackgroundReadAuthorizationStatus {
    val isFeatureAvailable = client.features.getFeatureStatus(
        HealthConnectFeatures.FEATURE_READ_HEALTH_DATA_IN_BACKGROUND
    ) == HealthConnectFeatures.FEATURE_STATUS_AVAILABLE
    val isPermissionDeclared = context.hasDeclaredPermission(backgroundReadPermission)
    val isPermissionGranted = client.permissionController
        .getGrantedPermissions()
        .contains(backgroundReadPermission)

    return resolveBackgroundReadAuthorizationStatus(
        isFeatureAvailable = isFeatureAvailable,
        isPermissionDeclared = isPermissionDeclared,
        isPermissionGranted = isPermissionGranted
    )
}
