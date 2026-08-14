package com.nitrohealth

import androidx.health.connect.client.records.Vo2MaxRecord
import androidx.health.connect.client.records.metadata.Metadata
import com.margelo.nitro.nitrohealth.NativeAndroidVo2MaxMeasurementMethod
import java.time.Instant
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertThrows
import org.junit.Test

class Vo2MaxRecordMappingTest {
    @Test
    fun mapsEveryMeasurementMethodInBothDirections() {
        val values = listOf(
            NativeAndroidVo2MaxMeasurementMethod.OTHER to Vo2MaxRecord.MEASUREMENT_METHOD_OTHER,
            NativeAndroidVo2MaxMeasurementMethod.METABOLICCART to
                Vo2MaxRecord.MEASUREMENT_METHOD_METABOLIC_CART,
            NativeAndroidVo2MaxMeasurementMethod.HEARTRATERATIO to
                Vo2MaxRecord.MEASUREMENT_METHOD_HEART_RATE_RATIO,
            NativeAndroidVo2MaxMeasurementMethod.COOPERTEST to
                Vo2MaxRecord.MEASUREMENT_METHOD_COOPER_TEST,
            NativeAndroidVo2MaxMeasurementMethod.MULTISTAGEFITNESSTEST to
                Vo2MaxRecord.MEASUREMENT_METHOD_MULTISTAGE_FITNESS_TEST,
            NativeAndroidVo2MaxMeasurementMethod.ROCKPORTFITNESSTEST to
                Vo2MaxRecord.MEASUREMENT_METHOD_ROCKPORT_FITNESS_TEST
        )

        values.forEach { (native, healthConnect) ->
            assertEquals(healthConnect, healthConnectVo2MaxMeasurementMethod(native))
            assertEquals(native, nativeVo2MaxMeasurementMethod(healthConnect))
        }
        assertEquals(
            Vo2MaxRecord.MEASUREMENT_METHOD_OTHER,
            healthConnectVo2MaxMeasurementMethod(null)
        )
    }

    @Test
    fun mapsMeasurementMethodOntoNativeSample() {
        val record = Vo2MaxRecord(
            time = Instant.parse("2026-01-01T09:00:00Z"),
            zoneOffset = null,
            metadata = Metadata.unknownRecordingMethod(),
            vo2MillilitersPerMinuteKilogram = 42.5,
            measurementMethod = Vo2MaxRecord.MEASUREMENT_METHOD_MULTISTAGE_FITNESS_TEST
        )

        val sample = makeNativeVo2MaxSample(record)

        assertEquals(
            NativeAndroidVo2MaxMeasurementMethod.MULTISTAGEFITNESSTEST,
            sample.androidMeasurementMethod
        )
        assertNull(sample.iosTestType)
    }

    @Test
    fun rejectsUnsupportedHealthConnectMeasurementMethod() {
        assertThrows(IllegalStateException::class.java) {
            nativeVo2MaxMeasurementMethod(Int.MAX_VALUE)
        }
    }
}
