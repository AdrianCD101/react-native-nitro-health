package com.nitrohealth

import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.ActiveCaloriesBurnedRecord
import androidx.health.connect.client.records.DistanceRecord
import androidx.health.connect.client.records.HeartRateRecord
import androidx.health.connect.client.records.StepsRecord
import org.junit.Assert.assertEquals
import org.junit.Assert.assertThrows
import org.junit.Test

class HealthConnectPermissionUtilsTest {
    @Test
    fun healthConnectRecordTypeForDataTypeMapsSupportedDataTypes() {
        assertEquals(StepsRecord::class, healthConnectRecordTypeForDataType("steps"))
        assertEquals(HeartRateRecord::class, healthConnectRecordTypeForDataType("heartRate"))
        assertEquals(DistanceRecord::class, healthConnectRecordTypeForDataType("distance"))
        assertEquals(
            ActiveCaloriesBurnedRecord::class,
            healthConnectRecordTypeForDataType("activeEnergyBurned")
        )
    }

    @Test
    fun toHealthConnectPermissionMapsReadPermissions() {
        assertEquals(
            HealthPermission.getReadPermission(StepsRecord::class),
            toHealthConnectPermission("steps", "read")
        )
        assertEquals(
            HealthPermission.getReadPermission(DistanceRecord::class),
            toHealthConnectPermission("distance", "read")
        )
        assertEquals(
            HealthPermission.getReadPermission(ActiveCaloriesBurnedRecord::class),
            toHealthConnectPermission("activeEnergyBurned", "read")
        )
        assertEquals(
            HealthPermission.getReadPermission(HeartRateRecord::class),
            toHealthConnectPermission("heartRate", "read")
        )
    }

    @Test
    fun toHealthConnectPermissionMapsWritePermissions() {
        assertEquals(
            HealthPermission.getWritePermission(StepsRecord::class),
            toHealthConnectPermission("steps", "write")
        )
        assertEquals(
            HealthPermission.getWritePermission(DistanceRecord::class),
            toHealthConnectPermission("distance", "write")
        )
        assertEquals(
            HealthPermission.getWritePermission(ActiveCaloriesBurnedRecord::class),
            toHealthConnectPermission("activeEnergyBurned", "write")
        )
        assertEquals(
            HealthPermission.getWritePermission(HeartRateRecord::class),
            toHealthConnectPermission("heartRate", "write")
        )
    }

    @Test
    fun healthConnectRecordTypeForDataTypeRejectsUnsupportedDataType() {
        val error = assertThrows(IllegalArgumentException::class.java) {
            healthConnectRecordTypeForDataType("sleep")
        }

        assertEquals("Unsupported health data type: sleep", error.message)
    }

    @Test
    fun toHealthConnectPermissionRejectsUnsupportedAccessType() {
        val error = assertThrows(IllegalArgumentException::class.java) {
            toHealthConnectPermission("steps", "delete")
        }

        assertEquals("Unsupported health permission access type: delete", error.message)
    }
}
