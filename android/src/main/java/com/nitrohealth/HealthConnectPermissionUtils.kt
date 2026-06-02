package com.nitrohealth

import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.ActiveCaloriesBurnedRecord
import androidx.health.connect.client.records.DistanceRecord
import androidx.health.connect.client.records.HeartRateRecord
import androidx.health.connect.client.records.Record
import androidx.health.connect.client.records.StepsRecord
import kotlin.reflect.KClass

internal fun healthConnectRecordTypeForDataType(dataType: String): KClass<out Record> {
    return when (dataType) {
        "steps" -> StepsRecord::class
        "heartRate" -> HeartRateRecord::class
        "distance" -> DistanceRecord::class
        "activeEnergyBurned" -> ActiveCaloriesBurnedRecord::class
        else -> throw IllegalArgumentException("Unsupported health data type: $dataType")
    }
}

internal fun toHealthConnectPermission(dataType: String, accessType: String): String {
    val recordType = healthConnectRecordTypeForDataType(dataType)

    return when (accessType) {
        "read" -> HealthPermission.getReadPermission(recordType)
        "write" -> HealthPermission.getWritePermission(recordType)
        else -> throw IllegalArgumentException("Unsupported health permission access type: $accessType")
    }
}
