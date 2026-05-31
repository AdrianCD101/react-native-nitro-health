package com.nitrohealth

import android.content.ActivityNotFoundException
import android.content.Intent
import android.net.Uri
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.HeartRateRecord
import androidx.health.connect.client.records.Record
import androidx.health.connect.client.records.StepsRecord
import com.margelo.nitro.NitroModules
import com.margelo.nitro.core.Promise
import com.margelo.nitro.nitrohealth.AuthorizationRequestStatus
import com.margelo.nitro.nitrohealth.HealthAuthorizationStatus
import com.margelo.nitro.nitrohealth.HealthAvailabilityStatus
import com.margelo.nitro.nitrohealth.HybridNitroHealthSpec
import com.margelo.nitro.nitrohealth.NativeHealthAuthorizationResult
import com.margelo.nitro.nitrohealth.NativeHealthPermission
import kotlin.reflect.KClass

class HybridNitroHealth: HybridNitroHealthSpec() {
    override fun isAvailable(): Boolean {
        return getAvailabilityStatus() == HealthAvailabilityStatus.AVAILABLE
    }

    override fun getAvailabilityStatus(): HealthAvailabilityStatus {
        val context = NitroModules.applicationContext ?: return HealthAvailabilityStatus.UNAVAILABLE

        return when (HealthConnectClient.getSdkStatus(context)) {
            HealthConnectClient.SDK_AVAILABLE -> HealthAvailabilityStatus.AVAILABLE
            HealthConnectClient.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED ->
                HealthAvailabilityStatus.PROVIDERUPDATEREQUIRED
            else -> HealthAvailabilityStatus.UNAVAILABLE
        }
    }

    override fun openHealthConnectInstall(): Boolean {
        val context = NitroModules.applicationContext ?: return false

        if (getAvailabilityStatus() != HealthAvailabilityStatus.PROVIDERUPDATEREQUIRED) {
            return false
        }

        val providerPackageName = "com.google.android.apps.healthdata"
        val uri = Uri.parse(
            "market://details?id=$providerPackageName&url=healthconnect%3A%2F%2Fonboarding"
        )
        val intent = Intent(Intent.ACTION_VIEW).apply {
            setPackage("com.android.vending")
            data = uri
            putExtra("overlay", true)
            putExtra("callerId", context.packageName)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }

        return try {
            context.startActivity(intent)
            true
        } catch (_: ActivityNotFoundException) {
            false
        }
    }

    override fun openHealthSettings(): Promise<Boolean> {
        val context = NitroModules.applicationContext
            ?: return Promise.resolved(false)

        return Promise.resolved(
            try {
                val intent = Intent(HealthConnectClient.ACTION_HEALTH_CONNECT_SETTINGS).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                context.startActivity(intent)
                true
            } catch (_: ActivityNotFoundException) {
                false
            }
        )
    }

    override fun getRequestStatusForAuthorization(
        permissions: Array<NativeHealthPermission>
    ): Promise<AuthorizationRequestStatus> {
        val context = NitroModules.applicationContext
            ?: return Promise.resolved(AuthorizationRequestStatus.UNKNOWN)

        if (getAvailabilityStatus() != HealthAvailabilityStatus.AVAILABLE) {
            return Promise.resolved(AuthorizationRequestStatus.UNKNOWN)
        }

        return Promise.async {
            val client = HealthConnectClient.getOrCreate(context)
            val grantedPermissions = client.permissionController.getGrantedPermissions()
            val requestedPermissions = permissions.map(::toHealthConnectPermission).toSet()

            if (grantedPermissions.containsAll(requestedPermissions)) {
                AuthorizationRequestStatus.UNNECESSARY
            } else {
                AuthorizationRequestStatus.SHOULDREQUEST
            }
        }
    }

    override fun requestAuthorization(
        permissions: Array<NativeHealthPermission>
    ): Promise<NativeHealthAuthorizationResult> {
        val context = NitroModules.applicationContext
            ?: return Promise.resolved(
                makeAuthorizationResult(
                    permissions = permissions,
                    availabilityStatus = HealthAvailabilityStatus.UNAVAILABLE,
                    requestStatus = AuthorizationRequestStatus.UNKNOWN
                )
            )

        val availabilityStatus = getAvailabilityStatus()

        if (availabilityStatus != HealthAvailabilityStatus.AVAILABLE) {
            return Promise.resolved(
                makeAuthorizationResult(
                    permissions = permissions,
                    availabilityStatus = availabilityStatus,
                    requestStatus = AuthorizationRequestStatus.UNKNOWN
                )
            )
        }

        return Promise.async {
            val client = HealthConnectClient.getOrCreate(context)
            val grantedPermissions = client.permissionController.getGrantedPermissions()
            val requestedPermissions = permissions.associateWith(::toHealthConnectPermission)
            val requestedPermissionSet = requestedPermissions.values.toSet()

            val updatedGrantedPermissions = if (grantedPermissions.containsAll(requestedPermissionSet)) {
                grantedPermissions
            } else {
                NitroHealthPermissionActivity.requestPermissions(
                    context,
                    requestedPermissionSet
                )
            }

            val grantedNativePermissions = requestedPermissions.filter { entry ->
                updatedGrantedPermissions.contains(entry.value)
            }.keys.toTypedArray()
            val deniedNativePermissions = requestedPermissions.filterNot { entry ->
                updatedGrantedPermissions.contains(entry.value)
            }.keys.toTypedArray()
            val requestStatus = if (deniedNativePermissions.isEmpty()) {
                AuthorizationRequestStatus.UNNECESSARY
            } else {
                AuthorizationRequestStatus.SHOULDREQUEST
            }

            makeAuthorizationResult(
                permissions = permissions,
                availabilityStatus = availabilityStatus,
                requestStatus = requestStatus,
                grantedPermissions = grantedNativePermissions,
                deniedPermissions = deniedNativePermissions
            )
        }
    }

    private fun makeAuthorizationResult(
        permissions: Array<NativeHealthPermission>,
        availabilityStatus: HealthAvailabilityStatus,
        requestStatus: AuthorizationRequestStatus,
        grantedPermissions: Array<NativeHealthPermission> = emptyArray(),
        deniedPermissions: Array<NativeHealthPermission> = permissions,
        unverifiablePermissions: Array<NativeHealthPermission> = emptyArray()
    ): NativeHealthAuthorizationResult {
        val status = when {
            availabilityStatus != HealthAvailabilityStatus.AVAILABLE -> HealthAuthorizationStatus.UNAVAILABLE
            deniedPermissions.isEmpty() -> HealthAuthorizationStatus.GRANTED
            grantedPermissions.isNotEmpty() || unverifiablePermissions.isNotEmpty() -> HealthAuthorizationStatus.PARTIAL
            else -> HealthAuthorizationStatus.DENIED
        }

        return NativeHealthAuthorizationResult(
            status = status,
            availabilityStatus = availabilityStatus,
            requestStatus = requestStatus,
            grantedPermissions = grantedPermissions,
            deniedPermissions = deniedPermissions,
            unverifiablePermissions = unverifiablePermissions
        )
    }

    private fun toHealthConnectPermission(permission: NativeHealthPermission): String {
        val recordType: KClass<out Record> = when (permission.dataType) {
            "steps" -> StepsRecord::class
            "heartRate" -> HeartRateRecord::class
            else -> throw IllegalArgumentException("Unsupported health data type: ${permission.dataType}")
        }

        return when (permission.accessType) {
            "read" -> HealthPermission.getReadPermission(recordType)
            "write" -> HealthPermission.getWritePermission(recordType)
            else -> throw IllegalArgumentException(
                "Unsupported health permission access type: ${permission.accessType}"
            )
        }
    }
}
