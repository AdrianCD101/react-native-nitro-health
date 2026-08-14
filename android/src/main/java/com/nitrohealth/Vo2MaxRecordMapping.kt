package com.nitrohealth

import androidx.health.connect.client.records.Vo2MaxRecord
import com.margelo.nitro.nitrohealth.NativeAndroidVo2MaxMeasurementMethod
import com.margelo.nitro.nitrohealth.NativeVo2MaxSample

internal fun healthConnectVo2MaxMeasurementMethod(
    value: NativeAndroidVo2MaxMeasurementMethod?
): Int {
    return when (value) {
        null,
        NativeAndroidVo2MaxMeasurementMethod.OTHER -> Vo2MaxRecord.MEASUREMENT_METHOD_OTHER
        NativeAndroidVo2MaxMeasurementMethod.METABOLICCART ->
            Vo2MaxRecord.MEASUREMENT_METHOD_METABOLIC_CART
        NativeAndroidVo2MaxMeasurementMethod.HEARTRATERATIO ->
            Vo2MaxRecord.MEASUREMENT_METHOD_HEART_RATE_RATIO
        NativeAndroidVo2MaxMeasurementMethod.COOPERTEST ->
            Vo2MaxRecord.MEASUREMENT_METHOD_COOPER_TEST
        NativeAndroidVo2MaxMeasurementMethod.MULTISTAGEFITNESSTEST ->
            Vo2MaxRecord.MEASUREMENT_METHOD_MULTISTAGE_FITNESS_TEST
        NativeAndroidVo2MaxMeasurementMethod.ROCKPORTFITNESSTEST ->
            Vo2MaxRecord.MEASUREMENT_METHOD_ROCKPORT_FITNESS_TEST
    }
}

internal fun nativeVo2MaxMeasurementMethod(
    value: Int
): NativeAndroidVo2MaxMeasurementMethod {
    return when (value) {
        Vo2MaxRecord.MEASUREMENT_METHOD_OTHER -> NativeAndroidVo2MaxMeasurementMethod.OTHER
        Vo2MaxRecord.MEASUREMENT_METHOD_METABOLIC_CART ->
            NativeAndroidVo2MaxMeasurementMethod.METABOLICCART
        Vo2MaxRecord.MEASUREMENT_METHOD_HEART_RATE_RATIO ->
            NativeAndroidVo2MaxMeasurementMethod.HEARTRATERATIO
        Vo2MaxRecord.MEASUREMENT_METHOD_COOPER_TEST ->
            NativeAndroidVo2MaxMeasurementMethod.COOPERTEST
        Vo2MaxRecord.MEASUREMENT_METHOD_MULTISTAGE_FITNESS_TEST ->
            NativeAndroidVo2MaxMeasurementMethod.MULTISTAGEFITNESSTEST
        Vo2MaxRecord.MEASUREMENT_METHOD_ROCKPORT_FITNESS_TEST ->
            NativeAndroidVo2MaxMeasurementMethod.ROCKPORTFITNESSTEST
        else -> throw IllegalStateException(
            "Health Connect returned unsupported VO2 max measurement method: $value"
        )
    }
}

internal fun makeNativeVo2MaxSample(record: Vo2MaxRecord): NativeVo2MaxSample {
    return NativeVo2MaxSample(
        identity = makeRecordIdentity(record.metadata.id),
        origin = makeHealthDataOrigin(record.metadata.dataOrigin.packageName),
        recordingMethod = nativeHealthRecordingMethod(record.metadata.recordingMethod),
        timeMs = record.time.toEpochMilli().toDouble(),
        millilitersPerKilogramPerMinute = record.vo2MillilitersPerMinuteKilogram,
        androidMeasurementMethod = nativeVo2MaxMeasurementMethod(record.measurementMethod),
        iosTestType = null
    )
}
