package com.nitrohealth

import androidx.health.connect.client.records.BloodPressureRecord
import com.margelo.nitro.nitrohealth.NativeBloodPressureBodyPosition
import com.margelo.nitro.nitrohealth.NativeBloodPressureMeasurementLocation
import com.margelo.nitro.nitrohealth.NativeBloodPressureSample

internal fun healthConnectBloodPressureBodyPosition(
    value: NativeBloodPressureBodyPosition?
): Int {
    return when (value) {
        null,
        NativeBloodPressureBodyPosition.UNSPECIFIED -> BloodPressureRecord.BODY_POSITION_UNKNOWN
        NativeBloodPressureBodyPosition.STANDINGUP -> BloodPressureRecord.BODY_POSITION_STANDING_UP
        NativeBloodPressureBodyPosition.SITTINGDOWN -> BloodPressureRecord.BODY_POSITION_SITTING_DOWN
        NativeBloodPressureBodyPosition.LYINGDOWN -> BloodPressureRecord.BODY_POSITION_LYING_DOWN
        NativeBloodPressureBodyPosition.RECLINING -> BloodPressureRecord.BODY_POSITION_RECLINING
    }
}

internal fun healthConnectBloodPressureMeasurementLocation(
    value: NativeBloodPressureMeasurementLocation?
): Int {
    return when (value) {
        null,
        NativeBloodPressureMeasurementLocation.UNSPECIFIED ->
            BloodPressureRecord.MEASUREMENT_LOCATION_UNKNOWN
        NativeBloodPressureMeasurementLocation.LEFTWRIST ->
            BloodPressureRecord.MEASUREMENT_LOCATION_LEFT_WRIST
        NativeBloodPressureMeasurementLocation.RIGHTWRIST ->
            BloodPressureRecord.MEASUREMENT_LOCATION_RIGHT_WRIST
        NativeBloodPressureMeasurementLocation.LEFTUPPERARM ->
            BloodPressureRecord.MEASUREMENT_LOCATION_LEFT_UPPER_ARM
        NativeBloodPressureMeasurementLocation.RIGHTUPPERARM ->
            BloodPressureRecord.MEASUREMENT_LOCATION_RIGHT_UPPER_ARM
    }
}

internal fun nativeBloodPressureBodyPosition(value: Int): NativeBloodPressureBodyPosition {
    return when (value) {
        BloodPressureRecord.BODY_POSITION_UNKNOWN -> NativeBloodPressureBodyPosition.UNSPECIFIED
        BloodPressureRecord.BODY_POSITION_STANDING_UP -> NativeBloodPressureBodyPosition.STANDINGUP
        BloodPressureRecord.BODY_POSITION_SITTING_DOWN -> NativeBloodPressureBodyPosition.SITTINGDOWN
        BloodPressureRecord.BODY_POSITION_LYING_DOWN -> NativeBloodPressureBodyPosition.LYINGDOWN
        BloodPressureRecord.BODY_POSITION_RECLINING -> NativeBloodPressureBodyPosition.RECLINING
        else -> throw IllegalStateException(
            "Health Connect returned unsupported blood pressure body position: $value"
        )
    }
}

internal fun nativeBloodPressureMeasurementLocation(
    value: Int
): NativeBloodPressureMeasurementLocation {
    return when (value) {
        BloodPressureRecord.MEASUREMENT_LOCATION_UNKNOWN ->
            NativeBloodPressureMeasurementLocation.UNSPECIFIED
        BloodPressureRecord.MEASUREMENT_LOCATION_LEFT_WRIST ->
            NativeBloodPressureMeasurementLocation.LEFTWRIST
        BloodPressureRecord.MEASUREMENT_LOCATION_RIGHT_WRIST ->
            NativeBloodPressureMeasurementLocation.RIGHTWRIST
        BloodPressureRecord.MEASUREMENT_LOCATION_LEFT_UPPER_ARM ->
            NativeBloodPressureMeasurementLocation.LEFTUPPERARM
        BloodPressureRecord.MEASUREMENT_LOCATION_RIGHT_UPPER_ARM ->
            NativeBloodPressureMeasurementLocation.RIGHTUPPERARM
        else -> throw IllegalStateException(
            "Health Connect returned unsupported blood pressure measurement location: $value"
        )
    }
}

internal fun makeNativeBloodPressureSample(record: BloodPressureRecord): NativeBloodPressureSample {
    return NativeBloodPressureSample(
        sampleMetadata = makeNativeHealthSampleMetadata(record.metadata, record.zoneOffset),
        timeMs = record.time.toEpochMilli().toDouble(),
        systolicMmHg = record.systolic.inMillimetersOfMercury,
        diastolicMmHg = record.diastolic.inMillimetersOfMercury,
        androidBodyPosition = nativeBloodPressureBodyPosition(record.bodyPosition),
        androidMeasurementLocation = nativeBloodPressureMeasurementLocation(
            record.measurementLocation
        )
    )
}
