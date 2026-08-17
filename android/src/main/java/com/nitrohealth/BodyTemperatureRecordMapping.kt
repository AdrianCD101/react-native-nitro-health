package com.nitrohealth

import androidx.health.connect.client.records.BasalBodyTemperatureRecord
import androidx.health.connect.client.records.BodyTemperatureMeasurementLocation
import androidx.health.connect.client.records.BodyTemperatureMeasurementLocations
import androidx.health.connect.client.records.BodyTemperatureRecord
import com.margelo.nitro.nitrohealth.NativeAndroidBodyTemperatureMeasurementLocation
import com.margelo.nitro.nitrohealth.NativeBasalBodyTemperatureSample
import com.margelo.nitro.nitrohealth.NativeBodyTemperatureSample

internal fun NativeAndroidBodyTemperatureMeasurementLocation?
    .toHealthConnectBodyTemperatureMeasurementLocation(): @BodyTemperatureMeasurementLocations Int {
    return when (this) {
        null,
        NativeAndroidBodyTemperatureMeasurementLocation.UNSPECIFIED ->
            BodyTemperatureMeasurementLocation.MEASUREMENT_LOCATION_UNKNOWN
        NativeAndroidBodyTemperatureMeasurementLocation.ARMPIT ->
            BodyTemperatureMeasurementLocation.MEASUREMENT_LOCATION_ARMPIT
        NativeAndroidBodyTemperatureMeasurementLocation.FINGER ->
            BodyTemperatureMeasurementLocation.MEASUREMENT_LOCATION_FINGER
        NativeAndroidBodyTemperatureMeasurementLocation.FOREHEAD ->
            BodyTemperatureMeasurementLocation.MEASUREMENT_LOCATION_FOREHEAD
        NativeAndroidBodyTemperatureMeasurementLocation.MOUTH ->
            BodyTemperatureMeasurementLocation.MEASUREMENT_LOCATION_MOUTH
        NativeAndroidBodyTemperatureMeasurementLocation.RECTUM ->
            BodyTemperatureMeasurementLocation.MEASUREMENT_LOCATION_RECTUM
        NativeAndroidBodyTemperatureMeasurementLocation.TEMPORALARTERY ->
            BodyTemperatureMeasurementLocation.MEASUREMENT_LOCATION_TEMPORAL_ARTERY
        NativeAndroidBodyTemperatureMeasurementLocation.TOE ->
            BodyTemperatureMeasurementLocation.MEASUREMENT_LOCATION_TOE
        NativeAndroidBodyTemperatureMeasurementLocation.EAR ->
            BodyTemperatureMeasurementLocation.MEASUREMENT_LOCATION_EAR
        NativeAndroidBodyTemperatureMeasurementLocation.WRIST ->
            BodyTemperatureMeasurementLocation.MEASUREMENT_LOCATION_WRIST
        NativeAndroidBodyTemperatureMeasurementLocation.VAGINA ->
            BodyTemperatureMeasurementLocation.MEASUREMENT_LOCATION_VAGINA
    }
}

internal fun nativeBodyTemperatureMeasurementLocation(
    value: @BodyTemperatureMeasurementLocations Int
): NativeAndroidBodyTemperatureMeasurementLocation {
    return when (value) {
        BodyTemperatureMeasurementLocation.MEASUREMENT_LOCATION_UNKNOWN ->
            NativeAndroidBodyTemperatureMeasurementLocation.UNSPECIFIED
        BodyTemperatureMeasurementLocation.MEASUREMENT_LOCATION_ARMPIT ->
            NativeAndroidBodyTemperatureMeasurementLocation.ARMPIT
        BodyTemperatureMeasurementLocation.MEASUREMENT_LOCATION_FINGER ->
            NativeAndroidBodyTemperatureMeasurementLocation.FINGER
        BodyTemperatureMeasurementLocation.MEASUREMENT_LOCATION_FOREHEAD ->
            NativeAndroidBodyTemperatureMeasurementLocation.FOREHEAD
        BodyTemperatureMeasurementLocation.MEASUREMENT_LOCATION_MOUTH ->
            NativeAndroidBodyTemperatureMeasurementLocation.MOUTH
        BodyTemperatureMeasurementLocation.MEASUREMENT_LOCATION_RECTUM ->
            NativeAndroidBodyTemperatureMeasurementLocation.RECTUM
        BodyTemperatureMeasurementLocation.MEASUREMENT_LOCATION_TEMPORAL_ARTERY ->
            NativeAndroidBodyTemperatureMeasurementLocation.TEMPORALARTERY
        BodyTemperatureMeasurementLocation.MEASUREMENT_LOCATION_TOE ->
            NativeAndroidBodyTemperatureMeasurementLocation.TOE
        BodyTemperatureMeasurementLocation.MEASUREMENT_LOCATION_EAR ->
            NativeAndroidBodyTemperatureMeasurementLocation.EAR
        BodyTemperatureMeasurementLocation.MEASUREMENT_LOCATION_WRIST ->
            NativeAndroidBodyTemperatureMeasurementLocation.WRIST
        BodyTemperatureMeasurementLocation.MEASUREMENT_LOCATION_VAGINA ->
            NativeAndroidBodyTemperatureMeasurementLocation.VAGINA
        else -> throw IllegalStateException(
            "Health Connect returned unsupported body temperature measurement location: $value"
        )
    }
}

internal fun makeNativeBodyTemperatureSample(
    record: BodyTemperatureRecord
): NativeBodyTemperatureSample {
    return NativeBodyTemperatureSample(
        sampleMetadata = makeNativeHealthSampleMetadata(record.metadata),
        timeMs = record.time.toEpochMilli().toDouble(),
        celsius = record.temperature.inCelsius,
        androidMeasurementLocation = nativeBodyTemperatureMeasurementLocation(record.measurementLocation),
        iosSensorLocation = null
    )
}

internal fun makeNativeBasalBodyTemperatureSample(
    record: BasalBodyTemperatureRecord
): NativeBasalBodyTemperatureSample {
    return NativeBasalBodyTemperatureSample(
        sampleMetadata = makeNativeHealthSampleMetadata(record.metadata),
        timeMs = record.time.toEpochMilli().toDouble(),
        celsius = record.temperature.inCelsius,
        androidMeasurementLocation = nativeBodyTemperatureMeasurementLocation(record.measurementLocation),
        iosSensorLocation = null
    )
}
