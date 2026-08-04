package com.nitrohealth

import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.ActiveCaloriesBurnedRecord
import androidx.health.connect.client.records.DistanceRecord
import androidx.health.connect.client.records.ExerciseSessionRecord
import androidx.health.connect.client.records.HeartRateRecord
import androidx.health.connect.client.records.HeartRateVariabilityRmssdRecord
import androidx.health.connect.client.records.HeightRecord
import androidx.health.connect.client.records.OxygenSaturationRecord
import androidx.health.connect.client.records.RestingHeartRateRecord
import androidx.health.connect.client.records.SleepSessionRecord
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.records.WeightRecord
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
        assertEquals(SleepSessionRecord::class, healthConnectRecordTypeForDataType("sleep"))
        assertEquals(WeightRecord::class, healthConnectRecordTypeForDataType("bodyMass"))
        assertEquals(
            RestingHeartRateRecord::class,
            healthConnectRecordTypeForDataType("restingHeartRate")
        )
        assertEquals(
            HeartRateVariabilityRmssdRecord::class,
            healthConnectRecordTypeForDataType("heartRateVariability")
        )
        assertEquals(
            OxygenSaturationRecord::class,
            healthConnectRecordTypeForDataType("oxygenSaturation")
        )
        assertEquals(HeightRecord::class, healthConnectRecordTypeForDataType("height"))
        assertEquals(
            ExerciseSessionRecord::class,
            healthConnectRecordTypeForDataType("workout")
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
        assertEquals(
            HealthPermission.getReadPermission(SleepSessionRecord::class),
            toHealthConnectPermission("sleep", "read")
        )
        assertEquals(
            HealthPermission.getReadPermission(WeightRecord::class),
            toHealthConnectPermission("bodyMass", "read")
        )
        assertEquals(
            HealthPermission.getReadPermission(RestingHeartRateRecord::class),
            toHealthConnectPermission("restingHeartRate", "read")
        )
        assertEquals(
            HealthPermission.getReadPermission(HeartRateVariabilityRmssdRecord::class),
            toHealthConnectPermission("heartRateVariability", "read")
        )
        assertEquals(
            HealthPermission.getReadPermission(OxygenSaturationRecord::class),
            toHealthConnectPermission("oxygenSaturation", "read")
        )
        assertEquals(
            HealthPermission.getReadPermission(HeightRecord::class),
            toHealthConnectPermission("height", "read")
        )
        assertEquals(
            HealthPermission.getReadPermission(ExerciseSessionRecord::class),
            toHealthConnectPermission("workout", "read")
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
        assertEquals(
            HealthPermission.getWritePermission(SleepSessionRecord::class),
            toHealthConnectPermission("sleep", "write")
        )
        assertEquals(
            HealthPermission.getWritePermission(WeightRecord::class),
            toHealthConnectPermission("bodyMass", "write")
        )
        assertEquals(
            HealthPermission.getWritePermission(RestingHeartRateRecord::class),
            toHealthConnectPermission("restingHeartRate", "write")
        )
        assertEquals(
            HealthPermission.getWritePermission(OxygenSaturationRecord::class),
            toHealthConnectPermission("oxygenSaturation", "write")
        )
        assertEquals(
            HealthPermission.getWritePermission(HeightRecord::class),
            toHealthConnectPermission("height", "write")
        )
        assertEquals(
            HealthPermission.getWritePermission(ExerciseSessionRecord::class),
            toHealthConnectPermission("workout", "write")
        )
    }

    @Test
    fun healthConnectRecordTypeForDataTypeRejectsUnsupportedDataType() {
        val error = assertThrows(IllegalArgumentException::class.java) {
            healthConnectRecordTypeForDataType("bloodGlucose")
        }

        assertEquals("Unsupported health data type: bloodGlucose", error.message)
    }

    @Test
    fun toHealthConnectPermissionRejectsUnsupportedAccessType() {
        val error = assertThrows(IllegalArgumentException::class.java) {
            toHealthConnectPermission("steps", "delete")
        }

        assertEquals("Unsupported health permission access type: delete", error.message)
    }
}
