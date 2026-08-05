package com.nitrohealth

import com.margelo.nitro.nitrohealth.HealthPermissionStatus
import com.margelo.nitro.nitrohealth.NativeHealthPermission
import com.margelo.nitro.nitrohealth.NativeHealthPermissionStatusEntry

internal fun makePermissionStatusEntries(
    permissions: Array<NativeHealthPermission>,
    grantedHealthConnectPermissions: Set<String>?
): Array<NativeHealthPermissionStatusEntry> {
    return permissions.map { permission ->
        val status = when {
            grantedHealthConnectPermissions == null -> HealthPermissionStatus.UNVERIFIABLE
            toHealthConnectPermission(permission.dataType, permission.accessType) in
                grantedHealthConnectPermissions -> HealthPermissionStatus.GRANTED
            else -> HealthPermissionStatus.NOTGRANTED
        }
        NativeHealthPermissionStatusEntry(permission = permission, status = status)
    }.toTypedArray()
}
