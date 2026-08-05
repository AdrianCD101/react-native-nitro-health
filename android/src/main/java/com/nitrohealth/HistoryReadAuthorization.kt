package com.nitrohealth

import android.content.Context
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.HealthConnectFeatures
import androidx.health.connect.client.permission.HealthPermission
import com.margelo.nitro.nitrohealth.NativeHealthAdditionalAccessStatus

internal val historyReadPermission: String =
    HealthPermission.PERMISSION_READ_HEALTH_DATA_HISTORY

internal suspend fun getHistoryReadAccessStatus(
    context: Context,
    client: HealthConnectClient
): NativeHealthAdditionalAccessStatus {
    return getAdditionalAccessStatus(
        context = context,
        client = client,
        feature = HealthConnectFeatures.FEATURE_READ_HEALTH_DATA_HISTORY,
        permission = historyReadPermission
    )
}
