package com.nitrohealth

import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.Record
import kotlin.reflect.KClass

internal fun healthConnectRecordTypeForDataType(dataType: String): KClass<out Record> {
    return healthDataTypeDescriptorFor(dataType).recordType
}

internal fun toHealthConnectPermission(dataType: String, accessType: String): String {
    val recordType = healthConnectRecordTypeForDataType(dataType)

    return when (accessType) {
        "read" -> HealthPermission.getReadPermission(recordType)
        "write" -> HealthPermission.getWritePermission(recordType)
        else -> throw IllegalArgumentException("Unsupported health permission access type: $accessType")
    }
}
