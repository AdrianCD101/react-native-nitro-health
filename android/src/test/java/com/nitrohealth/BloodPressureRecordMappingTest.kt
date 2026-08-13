package com.nitrohealth

import androidx.health.connect.client.records.BloodPressureRecord
import androidx.health.connect.client.records.metadata.Metadata
import androidx.health.connect.client.units.Pressure
import com.margelo.nitro.nitrohealth.NativeBloodPressureBodyPosition
import com.margelo.nitro.nitrohealth.NativeBloodPressureMeasurementLocation
import java.time.Instant
import org.junit.Assert.assertEquals
import org.junit.Test

class BloodPressureRecordMappingTest {
    @Test
    fun mapsEveryBodyPositionInBothDirections() {
        val values = listOf(
            NativeBloodPressureBodyPosition.UNSPECIFIED to
                BloodPressureRecord.BODY_POSITION_UNKNOWN,
            NativeBloodPressureBodyPosition.STANDINGUP to
                BloodPressureRecord.BODY_POSITION_STANDING_UP,
            NativeBloodPressureBodyPosition.SITTINGDOWN to
                BloodPressureRecord.BODY_POSITION_SITTING_DOWN,
            NativeBloodPressureBodyPosition.LYINGDOWN to
                BloodPressureRecord.BODY_POSITION_LYING_DOWN,
            NativeBloodPressureBodyPosition.RECLINING to
                BloodPressureRecord.BODY_POSITION_RECLINING
        )

        values.forEach { (native, healthConnect) ->
            assertEquals(healthConnect, healthConnectBloodPressureBodyPosition(native))
            assertEquals(native, nativeBloodPressureBodyPosition(healthConnect))
        }
    }

    @Test
    fun mapsEveryMeasurementLocationInBothDirections() {
        val values = listOf(
            NativeBloodPressureMeasurementLocation.UNSPECIFIED to
                BloodPressureRecord.MEASUREMENT_LOCATION_UNKNOWN,
            NativeBloodPressureMeasurementLocation.LEFTWRIST to
                BloodPressureRecord.MEASUREMENT_LOCATION_LEFT_WRIST,
            NativeBloodPressureMeasurementLocation.RIGHTWRIST to
                BloodPressureRecord.MEASUREMENT_LOCATION_RIGHT_WRIST,
            NativeBloodPressureMeasurementLocation.LEFTUPPERARM to
                BloodPressureRecord.MEASUREMENT_LOCATION_LEFT_UPPER_ARM,
            NativeBloodPressureMeasurementLocation.RIGHTUPPERARM to
                BloodPressureRecord.MEASUREMENT_LOCATION_RIGHT_UPPER_ARM
        )

        values.forEach { (native, healthConnect) ->
            assertEquals(healthConnect, healthConnectBloodPressureMeasurementLocation(native))
            assertEquals(native, nativeBloodPressureMeasurementLocation(healthConnect))
        }
    }

    @Test
    fun mapsAndroidMetadataFieldsOntoNativeSample() {
        val record = BloodPressureRecord(
            time = Instant.parse("2026-01-01T09:00:00Z"),
            zoneOffset = null,
            systolic = Pressure.millimetersOfMercury(118.0),
            diastolic = Pressure.millimetersOfMercury(76.0),
            bodyPosition = BloodPressureRecord.BODY_POSITION_SITTING_DOWN,
            measurementLocation = BloodPressureRecord.MEASUREMENT_LOCATION_LEFT_UPPER_ARM,
            metadata = Metadata.unknownRecordingMethod()
        )

        val sample = makeNativeBloodPressureSample(record)

        assertEquals(NativeBloodPressureBodyPosition.SITTINGDOWN, sample.androidBodyPosition)
        assertEquals(
            NativeBloodPressureMeasurementLocation.LEFTUPPERARM,
            sample.androidMeasurementLocation
        )
    }

    @Test
    fun mapsExplicitUnknownAndroidMetadataFieldsOntoNativeSample() {
        val record = BloodPressureRecord(
            time = Instant.parse("2026-01-01T09:00:00Z"),
            zoneOffset = null,
            systolic = Pressure.millimetersOfMercury(118.0),
            diastolic = Pressure.millimetersOfMercury(76.0),
            bodyPosition = BloodPressureRecord.BODY_POSITION_UNKNOWN,
            measurementLocation = BloodPressureRecord.MEASUREMENT_LOCATION_UNKNOWN,
            metadata = Metadata.unknownRecordingMethod()
        )

        val sample = makeNativeBloodPressureSample(record)

        assertEquals(NativeBloodPressureBodyPosition.UNSPECIFIED, sample.androidBodyPosition)
        assertEquals(
            NativeBloodPressureMeasurementLocation.UNSPECIFIED,
            sample.androidMeasurementLocation
        )
    }
}
