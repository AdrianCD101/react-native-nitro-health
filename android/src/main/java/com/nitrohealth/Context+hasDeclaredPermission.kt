package com.nitrohealth

import android.content.Context
import android.content.pm.PackageManager
import android.os.Build

internal fun Context.hasDeclaredPermission(permission: String): Boolean {
    val packageInfo = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        packageManager.getPackageInfo(
            packageName,
            PackageManager.PackageInfoFlags.of(PackageManager.GET_PERMISSIONS.toLong())
        )
    } else {
        @Suppress("DEPRECATION")
        packageManager.getPackageInfo(packageName, PackageManager.GET_PERMISSIONS)
    }

    return packageInfo.requestedPermissions?.contains(permission) == true
}
