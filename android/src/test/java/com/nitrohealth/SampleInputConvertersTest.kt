package com.nitrohealth

import androidx.health.connect.client.records.metadata.Metadata
import androidx.health.connect.client.records.BasalBodyTemperatureRecord
import androidx.health.connect.client.records.BloodGlucoseRecord
import androidx.health.connect.client.records.BloodPressureRecord
import androidx.health.connect.client.records.BodyTemperatureMeasurementLocation
import androidx.health.connect.client.records.MealType
import androidx.health.connect.client.records.Vo2MaxRecord
import com.margelo.nitro.nitrohealth.NativeActiveEnergyBurnedSampleInput
import com.margelo.nitro.nitrohealth.NativeBloodGlucoseSampleInput
import com.margelo.nitro.nitrohealth.NativeBloodGlucoseMealType
import com.margelo.nitro.nitrohealth.NativeBloodGlucoseRelationToMeal
import com.margelo.nitro.nitrohealth.NativeBloodGlucoseSpecimenSource
import com.margelo.nitro.nitrohealth.NativeBloodPressureBodyPosition
import com.margelo.nitro.nitrohealth.NativeBloodPressureMeasurementLocation
import com.margelo.nitro.nitrohealth.NativeBloodPressureSampleInput
import com.margelo.nitro.nitrohealth.NativeBasalBodyTemperatureSampleInput
import com.margelo.nitro.nitrohealth.NativeBodyFatSampleInput
import com.margelo.nitro.nitrohealth.NativeBodyTemperatureSampleInput
import com.margelo.nitro.nitrohealth.NativeBodyMassSampleInput
import com.margelo.nitro.nitrohealth.NativeDistanceSampleInput
import com.margelo.nitro.nitrohealth.NativeDistanceScope
import com.margelo.nitro.nitrohealth.NativeFloorsClimbedSampleInput
import com.margelo.nitro.nitrohealth.NativeHeartRateSampleInput
import com.margelo.nitro.nitrohealth.NativeHeightSampleInput
import com.margelo.nitro.nitrohealth.NativeHydrationSampleInput
import com.margelo.nitro.nitrohealth.NativeLeanBodyMassSampleInput
import com.margelo.nitro.nitrohealth.NativeOxygenSaturationSampleInput
import com.margelo.nitro.nitrohealth.NativeRespiratoryRateSampleInput
import com.margelo.nitro.nitrohealth.NativeRestingHeartRateSampleInput
import com.margelo.nitro.nitrohealth.NativeStepSampleInput
import com.margelo.nitro.nitrohealth.NativeVo2MaxSampleInput
import java.time.Instant
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertThrows
import org.junit.Test

class SampleInputConvertersTest {
    private val startTimeMs = 1_767_222_000_000.0
    private val endTimeMs = 1_767_223_800_000.0

    @Test
    fun toStepsRecordsMapsTimesAndCount() {
        val records = toStepsRecords(
            arrayOf(
                NativeStepSampleInput(
                    startTimeMs = startTimeMs,
                    endTimeMs = endTimeMs,
                    count = 512.0,
                    syncId = null,
                    syncVersion = null
                )
            )
        )

        assertEquals(1, records.size)
        assertEquals(Instant.ofEpochMilli(startTimeMs.toLong()), records[0].startTime)
        assertEquals(Instant.ofEpochMilli(endTimeMs.toLong()), records[0].endTime)
        assertEquals(512L, records[0].count)
    }

    @Test
    fun toDistanceRecordsMapsMeters() {
        val records = toDistanceRecords(
            arrayOf(
                NativeDistanceSampleInput(
                    startTimeMs = startTimeMs,
                    endTimeMs = endTimeMs,
                    distanceMeters = 1250.5,
                    scope = NativeDistanceScope.WALKINGRUNNING,
                    syncId = null,
                    syncVersion = null
                )
            )
        )

        assertEquals(1, records.size)
        assertEquals(1250.5, records[0].distance.inMeters, 0.0)
    }

    @Test
    fun toDistanceRecordsRejectsNonWalkingRunningInputScope() {
        val error = assertThrows(IllegalArgumentException::class.java) {
            toDistanceRecords(
                arrayOf(
                    NativeDistanceSampleInput(
                        startTimeMs = startTimeMs,
                        endTimeMs = endTimeMs,
                        distanceMeters = 1250.5,
                        scope = NativeDistanceScope.ACTIVITYUNSPECIFIED,
                        syncId = null,
                        syncVersion = null
                    )
                )
            )
        }

        assertEquals("samples[0].scope must be walkingRunning", error.message)
    }

    @Test
    fun toActiveCaloriesBurnedRecordsMapsKilocalories() {
        val records = toActiveCaloriesBurnedRecords(
            arrayOf(
                NativeActiveEnergyBurnedSampleInput(
                    startTimeMs = startTimeMs,
                    endTimeMs = endTimeMs,
                    kilocalories = 215.25,
                    syncId = null,
                    syncVersion = null
                )
            )
        )

        assertEquals(1, records.size)
        assertEquals(215.25, records[0].energy.inKilocalories, 0.0)
    }

    @Test
    fun toHydrationRecordsMapsMillilitersAndSyncMetadata() {
        val records = toHydrationRecords(
            arrayOf(
                NativeHydrationSampleInput(
                    startTimeMs = startTimeMs,
                    endTimeMs = endTimeMs,
                    milliliters = 250.5,
                    syncId = "hydration-sync",
                    syncVersion = 2.0
                )
            )
        )

        assertEquals(1, records.size)
        assertEquals(Instant.ofEpochMilli(startTimeMs.toLong()), records[0].startTime)
        assertEquals(Instant.ofEpochMilli(endTimeMs.toLong()), records[0].endTime)
        assertEquals(250.5, records[0].volume.inMilliliters, 0.0)
        assertEquals("hydration-sync", records[0].metadata.clientRecordId)
        assertEquals(2L, records[0].metadata.clientRecordVersion)
    }

    @Test
    fun toFloorsClimbedRecordsMapsIntervalFloors() {
        val records = toFloorsClimbedRecords(
            arrayOf(
                NativeFloorsClimbedSampleInput(
                    startTimeMs = startTimeMs,
                    endTimeMs = endTimeMs,
                    floors = 12.5,
                    syncId = null,
                    syncVersion = null
                )
            )
        )

        assertEquals(1, records.size)
        assertEquals(Instant.ofEpochMilli(startTimeMs.toLong()), records[0].startTime)
        assertEquals(Instant.ofEpochMilli(endTimeMs.toLong()), records[0].endTime)
        assertNull(records[0].startZoneOffset)
        assertNull(records[0].endZoneOffset)
        assertEquals(12.5, records[0].floors, 0.0)
    }

    @Test
    fun toHeartRateRecordsCreatesOneSingleSampleRecordPerReading() {
        val secondTimeMs = startTimeMs + 60_000

        val records = toHeartRateRecords(
            arrayOf(
                NativeHeartRateSampleInput(
                    timeMs = startTimeMs,
                    bpm = 72.0,
                    syncId = null,
                    syncVersion = null
                ),
                NativeHeartRateSampleInput(
                    timeMs = secondTimeMs,
                    bpm = 138.0,
                    syncId = null,
                    syncVersion = null
                )
            )
        )

        assertEquals(2, records.size)
        assertEquals(1, records[0].samples.size)
        assertEquals(Instant.ofEpochMilli(startTimeMs.toLong()), records[0].startTime)
        assertEquals(records[0].startTime, records[0].endTime)
        assertEquals(Instant.ofEpochMilli(startTimeMs.toLong()), records[0].samples[0].time)
        assertEquals(72L, records[0].samples[0].beatsPerMinute)
        assertEquals(138L, records[1].samples[0].beatsPerMinute)
    }

    @Test
    fun toHeartRateRecordsRoundsFractionalBpmToNearest() {
        val records = toHeartRateRecords(
            arrayOf(
                NativeHeartRateSampleInput(
                    timeMs = startTimeMs,
                    bpm = 72.9,
                    syncId = null,
                    syncVersion = null
                ),
                NativeHeartRateSampleInput(
                    timeMs = startTimeMs,
                    bpm = 72.4,
                    syncId = null,
                    syncVersion = null
                )
            )
        )

        assertEquals(73L, records[0].samples[0].beatsPerMinute)
        assertEquals(72L, records[1].samples[0].beatsPerMinute)
    }

    @Test
    fun toWeightRecordsMapsPointInTimeKilograms() {
        val records = toWeightRecords(
            arrayOf(
                NativeBodyMassSampleInput(
                    timeMs = startTimeMs,
                    kilograms = 72.5,
                    syncId = null,
                    syncVersion = null
                )
            )
        )

        assertEquals(1, records.size)
        assertEquals(Instant.ofEpochMilli(startTimeMs.toLong()), records[0].time)
        assertEquals(72.5, records[0].weight.inKilograms, 0.0)
    }

    @Test
    fun toRestingHeartRateRecordsMapsPointInTimeBpm() {
        val records = toRestingHeartRateRecords(
            arrayOf(
                NativeRestingHeartRateSampleInput(
                    timeMs = startTimeMs,
                    bpm = 58.0,
                    syncId = null,
                    syncVersion = null
                )
            )
        )

        assertEquals(1, records.size)
        assertEquals(Instant.ofEpochMilli(startTimeMs.toLong()), records[0].time)
        assertEquals(58L, records[0].beatsPerMinute)
    }

    @Test
    fun toRestingHeartRateRecordsRoundsFractionalBpmToNearest() {
        val records = toRestingHeartRateRecords(
            arrayOf(
                NativeRestingHeartRateSampleInput(
                    timeMs = startTimeMs,
                    bpm = 58.9,
                    syncId = null,
                    syncVersion = null
                ),
                NativeRestingHeartRateSampleInput(
                    timeMs = startTimeMs,
                    bpm = 58.4,
                    syncId = null,
                    syncVersion = null
                )
            )
        )

        assertEquals(59L, records[0].beatsPerMinute)
        assertEquals(58L, records[1].beatsPerMinute)
    }

    @Test
    fun toBloodPressureRecordsMapsPointInTimeValuesWithUnknownEnumFieldsByDefault() {
        val records = toBloodPressureRecords(
            arrayOf(
                NativeBloodPressureSampleInput(
                    timeMs = startTimeMs,
                    systolicMmHg = 118.0,
                    diastolicMmHg = 76.0,
                    androidBodyPosition = null,
                    androidMeasurementLocation = null,
                    syncId = null,
                    syncVersion = null
                )
            )
        )

        assertEquals(1, records.size)
        assertEquals(Instant.ofEpochMilli(startTimeMs.toLong()), records[0].time)
        assertNull(records[0].zoneOffset)
        assertEquals(118.0, records[0].systolic.inMillimetersOfMercury, 0.0)
        assertEquals(76.0, records[0].diastolic.inMillimetersOfMercury, 0.0)
        assertEquals(BloodPressureRecord.BODY_POSITION_UNKNOWN, records[0].bodyPosition)
        assertEquals(BloodPressureRecord.MEASUREMENT_LOCATION_UNKNOWN, records[0].measurementLocation)
    }

    @Test
    fun toBloodPressureRecordsMapsAndroidMetadataFields() {
        val record = toBloodPressureRecords(
            arrayOf(
                NativeBloodPressureSampleInput(
                    timeMs = startTimeMs,
                    systolicMmHg = 118.0,
                    diastolicMmHg = 76.0,
                    androidBodyPosition = NativeBloodPressureBodyPosition.SITTINGDOWN,
                    androidMeasurementLocation =
                        NativeBloodPressureMeasurementLocation.LEFTUPPERARM,
                    syncId = null,
                    syncVersion = null
                )
            )
        ).single()

        assertEquals(BloodPressureRecord.BODY_POSITION_SITTING_DOWN, record.bodyPosition)
        assertEquals(
            BloodPressureRecord.MEASUREMENT_LOCATION_LEFT_UPPER_ARM,
            record.measurementLocation
        )
    }

    @Test
    fun toBloodGlucoseRecordsMapsPointInTimeLevelWithUnknownEnumFields() {
        val records = toBloodGlucoseRecords(
            arrayOf(
                NativeBloodGlucoseSampleInput(
                    timeMs = startTimeMs,
                    millimolesPerLiter = 5.4,
                    androidSpecimenSource = null,
                    androidMealType = null,
                    androidRelationToMeal = null,
                    iosMealTime = null,
                    syncId = null,
                    syncVersion = null
                )
            )
        )

        assertEquals(1, records.size)
        assertEquals(Instant.ofEpochMilli(startTimeMs.toLong()), records[0].time)
        assertNull(records[0].zoneOffset)
        assertEquals(5.4, records[0].level.inMillimolesPerLiter, 0.0)
        assertEquals(BloodGlucoseRecord.SPECIMEN_SOURCE_UNKNOWN, records[0].specimenSource)
        assertEquals(MealType.MEAL_TYPE_UNKNOWN, records[0].mealType)
        assertEquals(BloodGlucoseRecord.RELATION_TO_MEAL_UNKNOWN, records[0].relationToMeal)
    }

    @Test
    fun toBloodGlucoseRecordsMapsAndroidMetadataFields() {
        val record = toBloodGlucoseRecords(
            arrayOf(
                NativeBloodGlucoseSampleInput(
                    timeMs = startTimeMs,
                    millimolesPerLiter = 5.4,
                    androidSpecimenSource = NativeBloodGlucoseSpecimenSource.CAPILLARYBLOOD,
                    androidMealType = NativeBloodGlucoseMealType.BREAKFAST,
                    androidRelationToMeal = NativeBloodGlucoseRelationToMeal.BEFOREMEAL,
                    iosMealTime = null,
                    syncId = null,
                    syncVersion = null
                )
            )
        ).single()

        assertEquals(BloodGlucoseRecord.SPECIMEN_SOURCE_CAPILLARY_BLOOD, record.specimenSource)
        assertEquals(MealType.MEAL_TYPE_BREAKFAST, record.mealType)
        assertEquals(BloodGlucoseRecord.RELATION_TO_MEAL_BEFORE_MEAL, record.relationToMeal)
    }

    @Test
    fun toBodyTemperatureRecordsMapsPointInTimeCelsiusWithUnknownLocation() {
        val records = toBodyTemperatureRecords(
            arrayOf(
                NativeBodyTemperatureSampleInput(
                    timeMs = startTimeMs,
                    celsius = 36.6,
                    androidMeasurementLocation = null,
                    iosSensorLocation = null,
                    syncId = null,
                    syncVersion = null
                )
            )
        )

        assertEquals(1, records.size)
        assertEquals(Instant.ofEpochMilli(startTimeMs.toLong()), records[0].time)
        assertNull(records[0].zoneOffset)
        assertEquals(36.6, records[0].temperature.inCelsius, 0.0)
        assertEquals(
            BodyTemperatureMeasurementLocation.MEASUREMENT_LOCATION_UNKNOWN,
            records[0].measurementLocation
        )
    }

    @Test
    fun toRespiratoryRateRecordsMapsPointInTimeBreathsPerMinute() {
        val records = toRespiratoryRateRecords(
            arrayOf(
                NativeRespiratoryRateSampleInput(
                    timeMs = startTimeMs,
                    breathsPerMinute = 16.5,
                    syncId = null,
                    syncVersion = null
                )
            )
        )

        assertEquals(1, records.size)
        assertEquals(Instant.ofEpochMilli(startTimeMs.toLong()), records[0].time)
        assertNull(records[0].zoneOffset)
        assertEquals(16.5, records[0].rate, 0.0)
    }

    @Test
    fun toBodyFatRecordsMapsPointInTimePercentage() {
        val records = toBodyFatRecords(
            arrayOf(
                NativeBodyFatSampleInput(
                    timeMs = startTimeMs,
                    percentage = 18.5,
                    syncId = null,
                    syncVersion = null
                )
            )
        )

        assertEquals(1, records.size)
        assertEquals(Instant.ofEpochMilli(startTimeMs.toLong()), records[0].time)
        assertNull(records[0].zoneOffset)
        assertEquals(18.5, records[0].percentage.value, 0.0)
    }

    @Test
    fun toLeanBodyMassRecordsMapsPointInTimeKilograms() {
        val records = toLeanBodyMassRecords(
            arrayOf(
                NativeLeanBodyMassSampleInput(
                    timeMs = startTimeMs,
                    kilograms = 55.4,
                    syncId = null,
                    syncVersion = null
                )
            )
        )

        assertEquals(1, records.size)
        assertEquals(Instant.ofEpochMilli(startTimeMs.toLong()), records[0].time)
        assertNull(records[0].zoneOffset)
        assertEquals(55.4, records[0].mass.inKilograms, 0.0)
    }

    @Test
    fun toBasalBodyTemperatureRecordsMapsPointInTimeCelsiusWithUnknownLocation() {
        val records = toBasalBodyTemperatureRecords(
            arrayOf(
                NativeBasalBodyTemperatureSampleInput(
                    timeMs = startTimeMs,
                    celsius = 36.4,
                    androidMeasurementLocation = null,
                    iosSensorLocation = null,
                    syncId = null,
                    syncVersion = null
                )
            )
        )

        assertEquals(1, records.size)
        assertEquals(Instant.ofEpochMilli(startTimeMs.toLong()), records[0].time)
        assertNull(records[0].zoneOffset)
        assertEquals(36.4, records[0].temperature.inCelsius, 0.0)
        assertEquals(
            BodyTemperatureMeasurementLocation.MEASUREMENT_LOCATION_UNKNOWN,
            records[0].measurementLocation
        )
    }

    @Test
    fun toOxygenSaturationRecordsMapsPointInTimePercentage() {
        val records = toOxygenSaturationRecords(
            arrayOf(
                NativeOxygenSaturationSampleInput(
                    timeMs = startTimeMs,
                    percentage = 97.5,
                    syncId = null,
                    syncVersion = null
                )
            )
        )

        assertEquals(1, records.size)
        assertEquals(Instant.ofEpochMilli(startTimeMs.toLong()), records[0].time)
        assertEquals(97.5, records[0].percentage.value, 0.0)
    }

    @Test
    fun toHeightRecordsMapsPointInTimeMeters() {
        val records = toHeightRecords(
            arrayOf(
                NativeHeightSampleInput(
                    timeMs = startTimeMs,
                    meters = 1.78,
                    syncId = null,
                    syncVersion = null
                )
            )
        )

        assertEquals(1, records.size)
        assertEquals(Instant.ofEpochMilli(startTimeMs.toLong()), records[0].time)
        assertEquals(1.78, records[0].height.inMeters, 0.0)
    }

    @Test
    fun toVo2MaxRecordsMapsPointInTimeMillilitersPerKilogramPerMinute() {
        val records = toVo2MaxRecords(
            arrayOf(
                NativeVo2MaxSampleInput(
                    timeMs = startTimeMs,
                    millilitersPerKilogramPerMinute = 42.5,
                    syncId = null,
                    syncVersion = null
                )
            )
        )

        assertEquals(1, records.size)
        assertEquals(Instant.ofEpochMilli(startTimeMs.toLong()), records[0].time)
        assertNull(records[0].zoneOffset)
        assertEquals(42.5, records[0].vo2MillilitersPerMinuteKilogram, 0.0)
        assertEquals(Vo2MaxRecord.MEASUREMENT_METHOD_OTHER, records[0].measurementMethod)
    }

    @Test
    fun allConvertersPreserveUnknownUnkeyedMetadata() {
        val metadata = metadataFromAllConverters(syncId = null, syncVersion = null)

        assertEquals(17, metadata.size)
        metadata.forEach {
            assertNull(it.clientRecordId)
            assertEquals(0L, it.clientRecordVersion)
            assertEquals(Metadata.RECORDING_METHOD_UNKNOWN, it.recordingMethod)
        }
    }

    @Test
    fun allConvertersMapVersionedSyncMetadata() {
        val metadata = metadataFromAllConverters(syncId = "sample-sync-id", syncVersion = 42.0)

        assertEquals(17, metadata.size)
        metadata.forEach {
            assertEquals("sample-sync-id", it.clientRecordId)
            assertEquals(42L, it.clientRecordVersion)
            assertEquals(Metadata.RECORDING_METHOD_UNKNOWN, it.recordingMethod)
        }
    }

    @Test
    fun toHeartRateRecordsSetsSyncMetadataOnParentRecord() {
        val record = toHeartRateRecords(
            arrayOf(
                NativeHeartRateSampleInput(
                    timeMs = startTimeMs,
                    bpm = 72.0,
                    syncId = "heart-rate-sync-id",
                    syncVersion = 7.0
                )
            )
        ).single()

        assertEquals("heart-rate-sync-id", record.metadata.clientRecordId)
        assertEquals(7L, record.metadata.clientRecordVersion)
        assertEquals(Metadata.RECORDING_METHOD_UNKNOWN, record.metadata.recordingMethod)
        assertEquals(1, record.samples.size)
    }

    private fun metadataFromAllConverters(
        syncId: String?,
        syncVersion: Double?
    ): List<Metadata> {
        return listOf(
            toStepsRecords(
                arrayOf(
                    NativeStepSampleInput(
                        startTimeMs = startTimeMs,
                        endTimeMs = endTimeMs,
                        count = 512.0,
                        syncId = syncId,
                        syncVersion = syncVersion
                    )
                )
            ).single().metadata,
            toDistanceRecords(
                arrayOf(
                    NativeDistanceSampleInput(
                        startTimeMs = startTimeMs,
                        endTimeMs = endTimeMs,
                        distanceMeters = 1250.5,
                        scope = NativeDistanceScope.WALKINGRUNNING,
                        syncId = syncId,
                        syncVersion = syncVersion
                    )
                )
            ).single().metadata,
            toActiveCaloriesBurnedRecords(
                arrayOf(
                    NativeActiveEnergyBurnedSampleInput(
                        startTimeMs = startTimeMs,
                        endTimeMs = endTimeMs,
                        kilocalories = 215.25,
                        syncId = syncId,
                        syncVersion = syncVersion
                    )
                )
            ).single().metadata,
            toFloorsClimbedRecords(
                arrayOf(
                    NativeFloorsClimbedSampleInput(
                        startTimeMs = startTimeMs,
                        endTimeMs = endTimeMs,
                        floors = 12.5,
                        syncId = syncId,
                        syncVersion = syncVersion
                    )
                )
            ).single().metadata,
            toHeartRateRecords(
                arrayOf(
                    NativeHeartRateSampleInput(
                        timeMs = startTimeMs,
                        bpm = 72.0,
                        syncId = syncId,
                        syncVersion = syncVersion
                    )
                )
            ).single().metadata,
            toWeightRecords(
                arrayOf(
                    NativeBodyMassSampleInput(
                        timeMs = startTimeMs,
                        kilograms = 72.5,
                        syncId = syncId,
                        syncVersion = syncVersion
                    )
                )
            ).single().metadata,
            toRestingHeartRateRecords(
                arrayOf(
                    NativeRestingHeartRateSampleInput(
                        timeMs = startTimeMs,
                        bpm = 58.0,
                        syncId = syncId,
                        syncVersion = syncVersion
                    )
                )
            ).single().metadata,
            toBloodPressureRecords(
                arrayOf(
                    NativeBloodPressureSampleInput(
                        timeMs = startTimeMs,
                        systolicMmHg = 118.0,
                        diastolicMmHg = 76.0,
                        androidBodyPosition = null,
                        androidMeasurementLocation = null,
                        syncId = syncId,
                        syncVersion = syncVersion
                    )
                )
            ).single().metadata,
            toBloodGlucoseRecords(
                arrayOf(
                    NativeBloodGlucoseSampleInput(
                        timeMs = startTimeMs,
                        millimolesPerLiter = 5.4,
                        androidSpecimenSource = null,
                        androidMealType = null,
                        androidRelationToMeal = null,
                        iosMealTime = null,
                        syncId = syncId,
                        syncVersion = syncVersion
                    )
                )
            ).single().metadata,
            toBodyTemperatureRecords(
                arrayOf(
                    NativeBodyTemperatureSampleInput(
                        timeMs = startTimeMs,
                        celsius = 36.6,
                        androidMeasurementLocation = null,
                        iosSensorLocation = null,
                        syncId = syncId,
                        syncVersion = syncVersion
                    )
                )
            ).single().metadata,
            toRespiratoryRateRecords(
                arrayOf(
                    NativeRespiratoryRateSampleInput(
                        timeMs = startTimeMs,
                        breathsPerMinute = 16.5,
                        syncId = syncId,
                        syncVersion = syncVersion
                    )
                )
            ).single().metadata,
            toBodyFatRecords(
                arrayOf(
                    NativeBodyFatSampleInput(
                        timeMs = startTimeMs,
                        percentage = 18.5,
                        syncId = syncId,
                        syncVersion = syncVersion
                    )
                )
            ).single().metadata,
            toLeanBodyMassRecords(
                arrayOf(
                    NativeLeanBodyMassSampleInput(
                        timeMs = startTimeMs,
                        kilograms = 55.4,
                        syncId = syncId,
                        syncVersion = syncVersion
                    )
                )
            ).single().metadata,
            toBasalBodyTemperatureRecords(
                arrayOf(
                    NativeBasalBodyTemperatureSampleInput(
                        timeMs = startTimeMs,
                        celsius = 36.4,
                        androidMeasurementLocation = null,
                        iosSensorLocation = null,
                        syncId = syncId,
                        syncVersion = syncVersion
                    )
                )
            ).single().metadata,
            toOxygenSaturationRecords(
                arrayOf(
                    NativeOxygenSaturationSampleInput(
                        timeMs = startTimeMs,
                        percentage = 97.5,
                        syncId = syncId,
                        syncVersion = syncVersion
                    )
                )
            ).single().metadata,
            toHeightRecords(
                arrayOf(
                    NativeHeightSampleInput(
                        timeMs = startTimeMs,
                        meters = 1.78,
                        syncId = syncId,
                        syncVersion = syncVersion
                    )
                )
            ).single().metadata,
            toVo2MaxRecords(
                arrayOf(
                    NativeVo2MaxSampleInput(
                        timeMs = startTimeMs,
                        millilitersPerKilogramPerMinute = 42.5,
                        syncId = syncId,
                        syncVersion = syncVersion
                    )
                )
            ).single().metadata
        )
    }
}
