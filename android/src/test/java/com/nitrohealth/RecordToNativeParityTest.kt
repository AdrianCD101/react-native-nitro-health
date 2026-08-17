package com.nitrohealth

import androidx.health.connect.client.changes.UpsertionChange
import androidx.health.connect.client.records.ActiveCaloriesBurnedRecord
import androidx.health.connect.client.records.BasalBodyTemperatureRecord
import androidx.health.connect.client.records.BloodGlucoseRecord
import androidx.health.connect.client.records.BloodPressureRecord
import androidx.health.connect.client.records.BodyFatRecord
import androidx.health.connect.client.records.BodyTemperatureMeasurementLocation
import androidx.health.connect.client.records.BodyTemperatureRecord
import androidx.health.connect.client.records.DistanceRecord
import androidx.health.connect.client.records.ExerciseSessionRecord
import androidx.health.connect.client.records.FloorsClimbedRecord
import androidx.health.connect.client.records.HeartRateRecord
import androidx.health.connect.client.records.HeartRateVariabilityRmssdRecord
import androidx.health.connect.client.records.HeightRecord
import androidx.health.connect.client.records.HydrationRecord
import androidx.health.connect.client.records.LeanBodyMassRecord
import androidx.health.connect.client.records.OxygenSaturationRecord
import androidx.health.connect.client.records.Record
import androidx.health.connect.client.records.RespiratoryRateRecord
import androidx.health.connect.client.records.RestingHeartRateRecord
import androidx.health.connect.client.records.SleepSessionRecord
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.records.Vo2MaxRecord
import androidx.health.connect.client.records.WeightRecord
import androidx.health.connect.client.records.metadata.Device
import androidx.health.connect.client.records.metadata.Metadata
import androidx.health.connect.client.units.BloodGlucose
import androidx.health.connect.client.units.Energy
import androidx.health.connect.client.units.Length
import androidx.health.connect.client.units.Mass
import androidx.health.connect.client.units.Percentage
import androidx.health.connect.client.units.Pressure
import androidx.health.connect.client.units.Temperature
import androidx.health.connect.client.units.Volume
import com.margelo.nitro.nitrohealth.NativeActiveEnergyBurnedSample
import com.margelo.nitro.nitrohealth.NativeBasalBodyTemperatureSample
import com.margelo.nitro.nitrohealth.NativeBloodGlucoseSample
import com.margelo.nitro.nitrohealth.NativeBloodPressureSample
import com.margelo.nitro.nitrohealth.NativeBodyFatSample
import com.margelo.nitro.nitrohealth.NativeBodyMassSample
import com.margelo.nitro.nitrohealth.NativeBodyTemperatureSample
import com.margelo.nitro.nitrohealth.NativeDistanceSample
import com.margelo.nitro.nitrohealth.NativeFloorsClimbedSample
import com.margelo.nitro.nitrohealth.NativeHealthChange
import com.margelo.nitro.nitrohealth.NativeHealthDeviceType
import com.margelo.nitro.nitrohealth.NativeHealthRecordingMethod
import com.margelo.nitro.nitrohealth.NativeHealthSampleMetadata
import com.margelo.nitro.nitrohealth.NativeHealthSampleIdentityKind
import com.margelo.nitro.nitrohealth.NativeHeartRateSample
import com.margelo.nitro.nitrohealth.NativeHeartRateVariabilitySample
import com.margelo.nitro.nitrohealth.NativeHeightSample
import com.margelo.nitro.nitrohealth.NativeHydrationSample
import com.margelo.nitro.nitrohealth.NativeLeanBodyMassSample
import com.margelo.nitro.nitrohealth.NativeOxygenSaturationSample
import com.margelo.nitro.nitrohealth.NativeRespiratoryRateSample
import com.margelo.nitro.nitrohealth.NativeRestingHeartRateSample
import com.margelo.nitro.nitrohealth.NativeSleepSample
import com.margelo.nitro.nitrohealth.NativeStepSample
import com.margelo.nitro.nitrohealth.NativeVo2MaxSample
import com.margelo.nitro.nitrohealth.NativeWorkoutSample
import java.time.Instant
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class RecordToNativeParityTest {
    private val start = Instant.parse("2026-01-01T00:00:00Z")
    private val end = start.plusSeconds(60)
    private val metadata = Metadata.autoRecorded(
        device = Device(
            type = Device.TYPE_WATCH,
            manufacturer = "Example Manufacturer",
            model = "Example Model"
        )
    )

    @Test
    fun directConvertersAndChangeUpsertsMatchForEveryReadableFamily() {
        readableRecords().forEach { (dataType, record) ->
            val direct = directSamples(record)
            val change = makeNativeHealthChange(
                UpsertionChange(record),
                dataType,
                record::class
            )
            val upserted = upsertedSamples(record, change)

            assertEquals("upsert", change.type)
            assertEquals(record.metadata.id, change.recordId)
            assertEquals("$dataType payload count", 1, populatedPayloadCount(change))
            assertEquals("$dataType converter parity", direct, upserted)
            direct.forEachIndexed { index, sample ->
                val sampleMetadata = sampleMetadata(sample)
                assertEquals(record.metadata.id, sampleMetadata.identityRecordId)
                assertEquals(record.metadata.dataOrigin.packageName, sampleMetadata.originIdentifier)
                assertNull(sampleMetadata.originDisplayName)
                assertEquals(NativeHealthDeviceType.WATCH, sampleMetadata.deviceType)
                assertEquals("Example Manufacturer", sampleMetadata.deviceManufacturer)
                assertEquals("Example Model", sampleMetadata.deviceModel)
                assertEquals(
                    NativeHealthRecordingMethod.AUTOMATICALLYRECORDED,
                    sampleMetadata.recordingMethod
                )

                when (record) {
                    is HeartRateRecord -> {
                        assertEquals(
                            NativeHealthSampleIdentityKind.RECORDCHILD,
                            sampleMetadata.identityKind
                        )
                        assertEquals("${record.metadata.id}#$index", sampleMetadata.identityId)
                    }
                    is SleepSessionRecord -> {
                        val expectedKind = if (index == 0) {
                            NativeHealthSampleIdentityKind.RECORD
                        } else {
                            NativeHealthSampleIdentityKind.RECORDCHILD
                        }
                        assertEquals(expectedKind, sampleMetadata.identityKind)
                        assertEquals(
                            if (index == 0) record.metadata.id else "${record.metadata.id}#${index - 1}",
                            sampleMetadata.identityId
                        )
                    }
                    else -> {
                        assertEquals(
                            NativeHealthSampleIdentityKind.RECORD,
                            sampleMetadata.identityKind
                        )
                        assertEquals(sampleMetadata.identityRecordId, sampleMetadata.identityId)
                    }
                }
            }
        }
    }

    private fun populatedPayloadCount(change: NativeHealthChange): Int {
        return listOf(
            change.stepSamples,
            change.heartRateSamples,
            change.bloodPressureSamples,
            change.bloodGlucoseSamples,
            change.bodyTemperatureSamples,
            change.respiratoryRateSamples,
            change.bodyFatSamples,
            change.leanBodyMassSamples,
            change.basalBodyTemperatureSamples,
            change.restingHeartRateSamples,
            change.heartRateVariabilitySamples,
            change.distanceSamples,
            change.activeEnergyBurnedSamples,
            change.hydrationSamples,
            change.floorsClimbedSamples,
            change.oxygenSaturationSamples,
            change.heightSamples,
            change.vo2MaxSamples,
            change.sleepSamples,
            change.bodyMassSamples,
            change.workoutSamples
        ).count { it != null }
    }

    private fun readableRecords(): List<Pair<String, Record>> {
        return listOf(
            "steps" to StepsRecord(
                startTime = start,
                startZoneOffset = null,
                endTime = end,
                endZoneOffset = null,
                count = 100,
                metadata = metadata
            ),
            "heartRate" to HeartRateRecord(
                startTime = start,
                startZoneOffset = null,
                endTime = end,
                endZoneOffset = null,
                samples = listOf(HeartRateRecord.Sample(start, 72)),
                metadata = metadata
            ),
            "bloodPressure" to BloodPressureRecord(
                time = start,
                zoneOffset = null,
                systolic = Pressure.millimetersOfMercury(120.0),
                diastolic = Pressure.millimetersOfMercury(80.0),
                metadata = metadata
            ),
            "bloodGlucose" to BloodGlucoseRecord(
                time = start,
                zoneOffset = null,
                metadata = metadata,
                level = BloodGlucose.millimolesPerLiter(5.4)
            ),
            "bodyTemperature" to BodyTemperatureRecord(
                time = start,
                zoneOffset = null,
                metadata = metadata,
                temperature = Temperature.celsius(36.6),
                measurementLocation =
                    BodyTemperatureMeasurementLocation.MEASUREMENT_LOCATION_UNKNOWN
            ),
            "respiratoryRate" to RespiratoryRateRecord(
                time = start,
                zoneOffset = null,
                metadata = metadata,
                rate = 16.0
            ),
            "bodyFat" to BodyFatRecord(
                time = start,
                zoneOffset = null,
                metadata = metadata,
                percentage = Percentage(18.0)
            ),
            "leanBodyMass" to LeanBodyMassRecord(
                time = start,
                zoneOffset = null,
                metadata = metadata,
                mass = Mass.kilograms(55.0)
            ),
            "basalBodyTemperature" to BasalBodyTemperatureRecord(
                time = start,
                zoneOffset = null,
                metadata = metadata,
                temperature = Temperature.celsius(36.4),
                measurementLocation =
                    BodyTemperatureMeasurementLocation.MEASUREMENT_LOCATION_UNKNOWN
            ),
            "restingHeartRate" to RestingHeartRateRecord(
                time = start,
                zoneOffset = null,
                beatsPerMinute = 58,
                metadata = metadata
            ),
            "heartRateVariability" to HeartRateVariabilityRmssdRecord(
                time = start,
                zoneOffset = null,
                heartRateVariabilityMillis = 42.0,
                metadata = metadata
            ),
            "distance" to DistanceRecord(
                startTime = start,
                startZoneOffset = null,
                endTime = end,
                endZoneOffset = null,
                distance = Length.meters(1000.0),
                metadata = metadata
            ),
            "activeEnergyBurned" to ActiveCaloriesBurnedRecord(
                startTime = start,
                startZoneOffset = null,
                endTime = end,
                endZoneOffset = null,
                energy = Energy.kilocalories(100.0),
                metadata = metadata
            ),
            "hydration" to HydrationRecord(
                startTime = start,
                startZoneOffset = null,
                endTime = end,
                endZoneOffset = null,
                volume = Volume.milliliters(250.0),
                metadata = metadata
            ),
            "floorsClimbed" to FloorsClimbedRecord(
                startTime = start,
                startZoneOffset = null,
                endTime = end,
                endZoneOffset = null,
                floors = 3.0,
                metadata = metadata
            ),
            "oxygenSaturation" to OxygenSaturationRecord(
                time = start,
                zoneOffset = null,
                percentage = Percentage(98.0),
                metadata = metadata
            ),
            "height" to HeightRecord(
                time = start,
                zoneOffset = null,
                height = Length.meters(1.8),
                metadata = metadata
            ),
            "vo2Max" to Vo2MaxRecord(
                time = start,
                zoneOffset = null,
                metadata = metadata,
                vo2MillilitersPerMinuteKilogram = 42.0,
                measurementMethod = Vo2MaxRecord.MEASUREMENT_METHOD_OTHER
            ),
            "sleep" to SleepSessionRecord(
                startTime = start,
                startZoneOffset = null,
                endTime = end,
                endZoneOffset = null,
                stages = listOf(
                    SleepSessionRecord.Stage(start, end, SleepSessionRecord.STAGE_TYPE_LIGHT)
                ),
                metadata = metadata
            ),
            "bodyMass" to WeightRecord(
                time = start,
                zoneOffset = null,
                weight = Mass.kilograms(72.0),
                metadata = metadata
            ),
            "workout" to ExerciseSessionRecord(
                startTime = start,
                startZoneOffset = null,
                endTime = end,
                endZoneOffset = null,
                exerciseType = ExerciseSessionRecord.EXERCISE_TYPE_RUNNING,
                metadata = metadata
            )
        )
    }

    private fun directSamples(record: Record): List<Any> {
        return when (record) {
            is StepsRecord -> listOf(makeNativeStepSample(record))
            is HeartRateRecord -> makeNativeHeartRateSamples(record).toList()
            is BloodPressureRecord -> listOf(makeNativeBloodPressureSample(record))
            is BloodGlucoseRecord -> listOf(makeNativeBloodGlucoseSample(record))
            is BodyTemperatureRecord -> listOf(makeNativeBodyTemperatureSample(record))
            is RespiratoryRateRecord -> listOf(makeNativeRespiratoryRateSample(record))
            is BodyFatRecord -> listOf(makeNativeBodyFatSample(record))
            is LeanBodyMassRecord -> listOf(makeNativeLeanBodyMassSample(record))
            is BasalBodyTemperatureRecord -> listOf(makeNativeBasalBodyTemperatureSample(record))
            is RestingHeartRateRecord -> listOf(makeNativeRestingHeartRateSample(record))
            is HeartRateVariabilityRmssdRecord -> listOf(makeNativeHeartRateVariabilitySample(record))
            is DistanceRecord -> listOf(makeNativeDistanceSample(record))
            is ActiveCaloriesBurnedRecord -> listOf(makeNativeActiveEnergyBurnedSample(record))
            is HydrationRecord -> listOf(makeNativeHydrationSample(record))
            is FloorsClimbedRecord -> listOf(makeNativeFloorsClimbedSample(record))
            is OxygenSaturationRecord -> listOf(makeNativeOxygenSaturationSample(record))
            is HeightRecord -> listOf(makeNativeHeightSample(record))
            is Vo2MaxRecord -> listOf(makeNativeVo2MaxSample(record))
            is SleepSessionRecord -> makeNativeSleepSamples(record).toList()
            is WeightRecord -> listOf(makeNativeBodyMassSample(record))
            is ExerciseSessionRecord -> listOf(makeNativeWorkoutSample(record))
            else -> error("Unsupported test record ${record.javaClass.name}")
        }
    }

    private fun upsertedSamples(record: Record, change: NativeHealthChange): List<Any> {
        return when (record) {
            is StepsRecord -> change.stepSamples!!.toList()
            is HeartRateRecord -> change.heartRateSamples!!.toList()
            is BloodPressureRecord -> change.bloodPressureSamples!!.toList()
            is BloodGlucoseRecord -> change.bloodGlucoseSamples!!.toList()
            is BodyTemperatureRecord -> change.bodyTemperatureSamples!!.toList()
            is RespiratoryRateRecord -> change.respiratoryRateSamples!!.toList()
            is BodyFatRecord -> change.bodyFatSamples!!.toList()
            is LeanBodyMassRecord -> change.leanBodyMassSamples!!.toList()
            is BasalBodyTemperatureRecord -> change.basalBodyTemperatureSamples!!.toList()
            is RestingHeartRateRecord -> change.restingHeartRateSamples!!.toList()
            is HeartRateVariabilityRmssdRecord -> change.heartRateVariabilitySamples!!.toList()
            is DistanceRecord -> change.distanceSamples!!.toList()
            is ActiveCaloriesBurnedRecord -> change.activeEnergyBurnedSamples!!.toList()
            is HydrationRecord -> change.hydrationSamples!!.toList()
            is FloorsClimbedRecord -> change.floorsClimbedSamples!!.toList()
            is OxygenSaturationRecord -> change.oxygenSaturationSamples!!.toList()
            is HeightRecord -> change.heightSamples!!.toList()
            is Vo2MaxRecord -> change.vo2MaxSamples!!.toList()
            is SleepSessionRecord -> change.sleepSamples!!.toList()
            is WeightRecord -> change.bodyMassSamples!!.toList()
            is ExerciseSessionRecord -> change.workoutSamples!!.toList()
            else -> error("Unsupported test record ${record.javaClass.name}")
        }
    }

    private fun sampleMetadata(sample: Any): NativeHealthSampleMetadata {
        return when (sample) {
            is NativeStepSample -> sample.sampleMetadata
            is NativeHeartRateSample -> sample.sampleMetadata
            is NativeBloodPressureSample -> sample.sampleMetadata
            is NativeBloodGlucoseSample -> sample.sampleMetadata
            is NativeBodyTemperatureSample -> sample.sampleMetadata
            is NativeRespiratoryRateSample -> sample.sampleMetadata
            is NativeBodyFatSample -> sample.sampleMetadata
            is NativeLeanBodyMassSample -> sample.sampleMetadata
            is NativeBasalBodyTemperatureSample -> sample.sampleMetadata
            is NativeRestingHeartRateSample -> sample.sampleMetadata
            is NativeHeartRateVariabilitySample -> sample.sampleMetadata
            is NativeDistanceSample -> sample.sampleMetadata
            is NativeActiveEnergyBurnedSample -> sample.sampleMetadata
            is NativeHydrationSample -> sample.sampleMetadata
            is NativeFloorsClimbedSample -> sample.sampleMetadata
            is NativeOxygenSaturationSample -> sample.sampleMetadata
            is NativeHeightSample -> sample.sampleMetadata
            is NativeVo2MaxSample -> sample.sampleMetadata
            is NativeSleepSample -> sample.sampleMetadata
            is NativeBodyMassSample -> sample.sampleMetadata
            is NativeWorkoutSample -> sample.sampleMetadata
            else -> error("Unsupported test sample ${sample.javaClass.name}")
        }
    }
}
