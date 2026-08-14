package com.nitrohealth

import androidx.health.connect.client.records.BodyTemperatureMeasurementLocation
import com.margelo.nitro.nitrohealth.NativeAndroidBodyTemperatureMeasurementLocation
import org.junit.Assert.assertEquals
import org.junit.Test

class BodyTemperatureRecordMappingTest {
    @Test
    fun mapsEveryMeasurementLocationInBothDirections() {
        val values = listOf(
            NativeAndroidBodyTemperatureMeasurementLocation.UNSPECIFIED to
                BodyTemperatureMeasurementLocation.MEASUREMENT_LOCATION_UNKNOWN,
            NativeAndroidBodyTemperatureMeasurementLocation.ARMPIT to
                BodyTemperatureMeasurementLocation.MEASUREMENT_LOCATION_ARMPIT,
            NativeAndroidBodyTemperatureMeasurementLocation.FINGER to
                BodyTemperatureMeasurementLocation.MEASUREMENT_LOCATION_FINGER,
            NativeAndroidBodyTemperatureMeasurementLocation.FOREHEAD to
                BodyTemperatureMeasurementLocation.MEASUREMENT_LOCATION_FOREHEAD,
            NativeAndroidBodyTemperatureMeasurementLocation.MOUTH to
                BodyTemperatureMeasurementLocation.MEASUREMENT_LOCATION_MOUTH,
            NativeAndroidBodyTemperatureMeasurementLocation.RECTUM to
                BodyTemperatureMeasurementLocation.MEASUREMENT_LOCATION_RECTUM,
            NativeAndroidBodyTemperatureMeasurementLocation.TEMPORALARTERY to
                BodyTemperatureMeasurementLocation.MEASUREMENT_LOCATION_TEMPORAL_ARTERY,
            NativeAndroidBodyTemperatureMeasurementLocation.TOE to
                BodyTemperatureMeasurementLocation.MEASUREMENT_LOCATION_TOE,
            NativeAndroidBodyTemperatureMeasurementLocation.EAR to
                BodyTemperatureMeasurementLocation.MEASUREMENT_LOCATION_EAR,
            NativeAndroidBodyTemperatureMeasurementLocation.WRIST to
                BodyTemperatureMeasurementLocation.MEASUREMENT_LOCATION_WRIST,
            NativeAndroidBodyTemperatureMeasurementLocation.VAGINA to
                BodyTemperatureMeasurementLocation.MEASUREMENT_LOCATION_VAGINA
        )

        values.forEach { (native, healthConnect) ->
            assertEquals(
                healthConnect,
                native.toHealthConnectBodyTemperatureMeasurementLocation()
            )
            assertEquals(native, nativeBodyTemperatureMeasurementLocation(healthConnect))
        }
    }
}
