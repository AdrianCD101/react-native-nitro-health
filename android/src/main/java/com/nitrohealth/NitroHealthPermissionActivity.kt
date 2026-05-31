package com.nitrohealth

import android.content.Context
import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.health.connect.client.contracts.HealthPermissionsRequestContract
import kotlinx.coroutines.CompletableDeferred

class NitroHealthPermissionActivity : ComponentActivity() {
    private val requestPermissions = registerForActivityResult(
        HealthPermissionsRequestContract()
    ) { grantedPermissions ->
        pendingRequest?.complete(grantedPermissions)
        pendingRequest = null
        finish()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val permissions = intent.getStringArrayListExtra(EXTRA_PERMISSIONS)?.toSet().orEmpty()
        if (permissions.isEmpty()) {
            pendingRequest?.complete(emptySet())
            pendingRequest = null
            finish()
            return
        }

        requestPermissions.launch(permissions)
    }

    override fun onDestroy() {
        if (isFinishing) {
            pendingRequest?.complete(emptySet())
            pendingRequest = null
        }

        super.onDestroy()
    }

    companion object {
        private const val EXTRA_PERMISSIONS = "com.nitrohealth.PERMISSIONS"
        private var pendingRequest: CompletableDeferred<Set<String>>? = null

        suspend fun requestPermissions(
            context: Context,
            permissions: Set<String>
        ): Set<String> {
            check(pendingRequest == null) {
                "A Health Connect permission request is already in progress."
            }

            val request = CompletableDeferred<Set<String>>()
            pendingRequest = request

            val intent = Intent(context, NitroHealthPermissionActivity::class.java).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                putStringArrayListExtra(EXTRA_PERMISSIONS, ArrayList(permissions))
            }

            try {
                context.startActivity(intent)
            } catch (error: Throwable) {
                pendingRequest = null
                throw error
            }

            return request.await()
        }
    }
}
