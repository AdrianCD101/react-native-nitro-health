package com.nitrohealth

import android.content.Context
import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.contracts.HealthPermissionsRequestContract
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.NonCancellable
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import java.util.UUID

class NitroHealthPermissionActivity : ComponentActivity() {
    private val requestPermissions = registerForActivityResult(
        HealthPermissionsRequestContract()
    ) { grantedPermissions ->
        completeRequest(requestId(), grantedPermissions)
        finish()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val requestId = requestId()
        if (requestId == null || !hasPendingRequest(requestId)) {
            finish()
            return
        }

        if (savedInstanceState != null) return

        val permissions = intent.getStringArrayListExtra(EXTRA_PERMISSIONS)?.toSet().orEmpty()
        if (permissions.isEmpty()) {
            completeRequest(requestId, emptySet())
            finish()
            return
        }

        try {
            requestPermissions.launch(permissions)
        } catch (error: Exception) {
            failRequest(requestId, error)
            finish()
        }
    }

    override fun onDestroy() {
        if (isFinishing) {
            completeRequest(requestId(), emptySet())
        }

        super.onDestroy()
    }

    private fun requestId(): String? = intent.getStringExtra(EXTRA_REQUEST_ID)

    companion object {
        private const val EXTRA_PERMISSIONS = "com.nitrohealth.PERMISSIONS"
        private const val EXTRA_REQUEST_ID = "com.nitrohealth.PERMISSION_REQUEST_ID"
        private val requestMutex = Mutex()
        @Volatile
        private var pendingRequest: PendingPermissionRequest? = null

        private data class PendingPermissionRequest(
            val id: String,
            val result: CompletableDeferred<Set<String>>
        )

        private fun hasPendingRequest(requestId: String): Boolean {
            return pendingRequest?.id == requestId
        }

        private fun completeRequest(requestId: String?, grantedPermissions: Set<String>) {
            val request = pendingRequest
            if (requestId != null && request?.id == requestId) {
                request.result.complete(grantedPermissions)
            }
        }

        private fun failRequest(requestId: String, error: Exception) {
            val request = pendingRequest
            if (request?.id == requestId) {
                request.result.completeExceptionally(error)
            }
        }

        suspend fun requestPermissions(
            context: Context,
            permissions: Set<String>
        ): Set<String> {
            return requestMutex.withLock {
                val client = HealthConnectClient.getOrCreate(context)
                val missingPermissions = permissions -
                    client.permissionController.getGrantedPermissions()
                if (missingPermissions.isEmpty()) return@withLock permissions

                val request = PendingPermissionRequest(
                    id = UUID.randomUUID().toString(),
                    result = CompletableDeferred()
                )
                pendingRequest = request
                try {
                    val intent = Intent(context, NitroHealthPermissionActivity::class.java).apply {
                        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                        putExtra(EXTRA_REQUEST_ID, request.id)
                        putStringArrayListExtra(EXTRA_PERMISSIONS, ArrayList(missingPermissions))
                    }
                    context.startActivity(intent)
                    withContext(NonCancellable) { request.result.await() }
                } finally {
                    if (pendingRequest === request) {
                        pendingRequest = null
                    }
                }
            }
        }
    }
}
