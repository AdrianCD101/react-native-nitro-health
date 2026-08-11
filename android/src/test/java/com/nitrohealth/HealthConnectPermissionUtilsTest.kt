package com.nitrohealth

import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.ActiveCaloriesBurnedRecord
import androidx.health.connect.client.records.BloodGlucoseRecord
import androidx.health.connect.client.records.BloodPressureRecord
import androidx.health.connect.client.records.BodyTemperatureRecord
import androidx.health.connect.client.records.DistanceRecord
import androidx.health.connect.client.records.ExerciseSessionRecord
import androidx.health.connect.client.records.HeartRateRecord
import androidx.health.connect.client.records.HeartRateVariabilityRmssdRecord
import androidx.health.connect.client.records.HeightRecord
import androidx.health.connect.client.records.OxygenSaturationRecord
import androidx.health.connect.client.records.RespiratoryRateRecord
import androidx.health.connect.client.records.RestingHeartRateRecord
import androidx.health.connect.client.records.SleepSessionRecord
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.records.WeightRecord
import com.margelo.nitro.nitrohealth.HealthPermissionStatus
import com.margelo.nitro.nitrohealth.NativeHealthPermission
import org.junit.Assert.assertEquals
import org.junit.Assert.assertThrows
import org.junit.Test

class HealthConnectPermissionUtilsTest {
    @Test
    fun healthConnectRecordTypeForDataTypeMapsSupportedDataTypes() {
        assertEquals(StepsRecord::class, healthConnectRecordTypeForDataType("steps"))
        assertEquals(HeartRateRecord::class, healthConnectRecordTypeForDataType("heartRate"))
        assertEquals(BloodPressureRecord::class, healthConnectRecordTypeForDataType("bloodPressure"))
        assertEquals(BloodGlucoseRecord::class, healthConnectRecordTypeForDataType("bloodGlucose"))
        assertEquals(
            BodyTemperatureRecord::class,
            healthConnectRecordTypeForDataType("bodyTemperature")
        )
        assertEquals(
            RespiratoryRateRecord::class,
            healthConnectRecordTypeForDataType("respiratoryRate")
        )
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
            HealthPermission.getReadPermission(BloodPressureRecord::class),
            toHealthConnectPermission("bloodPressure", "read")
        )
        assertEquals(
            HealthPermission.getReadPermission(BloodGlucoseRecord::class),
            toHealthConnectPermission("bloodGlucose", "read")
        )
        assertEquals(
            HealthPermission.getReadPermission(BodyTemperatureRecord::class),
            toHealthConnectPermission("bodyTemperature", "read")
        )
        assertEquals(
            HealthPermission.getReadPermission(RespiratoryRateRecord::class),
            toHealthConnectPermission("respiratoryRate", "read")
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
            HealthPermission.getWritePermission(BloodPressureRecord::class),
            toHealthConnectPermission("bloodPressure", "write")
        )
        assertEquals(
            HealthPermission.getWritePermission(BloodGlucoseRecord::class),
            toHealthConnectPermission("bloodGlucose", "write")
        )
        assertEquals(
            HealthPermission.getWritePermission(BodyTemperatureRecord::class),
            toHealthConnectPermission("bodyTemperature", "write")
        )
        assertEquals(
            HealthPermission.getWritePermission(RespiratoryRateRecord::class),
            toHealthConnectPermission("respiratoryRate", "write")
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
            healthConnectRecordTypeForDataType("bodyFat")
        }

        assertEquals("Unsupported health data type: bodyFat", error.message)
    }

    @Test
    fun toHealthConnectPermissionRejectsUnsupportedAccessType() {
        val error = assertThrows(IllegalArgumentException::class.java) {
            toHealthConnectPermission("steps", "delete")
        }

        assertEquals("Unsupported health permission access type: delete", error.message)
    }

    @Test
    fun permissionStatusesPreserveRequestedEntriesAndOrder() {
        val permissions = arrayOf(
            NativeHealthPermission(accessType = "write", dataType = "steps"),
            NativeHealthPermission(accessType = "read", dataType = "distance"),
            NativeHealthPermission(accessType = "read", dataType = "steps")
        )
        val statuses = makePermissionStatusEntries(
            permissions = permissions,
            grantedHealthConnectPermissions = setOf(
                HealthPermission.getReadPermission(StepsRecord::class)
            )
        )

        assertEquals(permissions.toList(), statuses.map { it.permission })
        assertEquals(
            listOf(
                HealthPermissionStatus.NOTGRANTED,
                HealthPermissionStatus.NOTGRANTED,
                HealthPermissionStatus.GRANTED
            ),
            statuses.map { it.status }
        )
    }

    @Test
    fun unavailablePermissionStatusesAreAllUnverifiable() {
        val statuses = makePermissionStatusEntries(
            permissions = arrayOf(
                NativeHealthPermission(accessType = "read", dataType = "steps"),
                NativeHealthPermission(accessType = "write", dataType = "distance")
            ),
            grantedHealthConnectPermissions = null
        )

        assertEquals(
            listOf(HealthPermissionStatus.UNVERIFIABLE, HealthPermissionStatus.UNVERIFIABLE),
            statuses.map { it.status }
        )
    }
}
