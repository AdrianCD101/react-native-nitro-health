package com.nitrohealth

import androidx.health.connect.client.HealthConnectClient
import com.margelo.nitro.NitroModules
import com.margelo.nitro.nitrohealth.HybridNitroHealthSpec

class HybridNitroHealth: HybridNitroHealthSpec() {    
    override fun isAvailable(): Boolean {
        val context = NitroModules.applicationContext ?: return false

        return HealthConnectClient.getSdkStatus(context) == HealthConnectClient.SDK_AVAILABLE
    }
}
