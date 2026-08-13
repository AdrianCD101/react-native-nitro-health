package com.nitrohealth

import androidx.health.connect.client.aggregate.AggregateMetric
import androidx.health.connect.client.aggregate.AggregationResult
import androidx.health.connect.client.records.ActiveCaloriesBurnedRecord
import androidx.health.connect.client.records.BasalBodyTemperatureRecord
import androidx.health.connect.client.records.BasalMetabolicRateRecord
import androidx.health.connect.client.records.BloodGlucoseRecord
import androidx.health.connect.client.records.BloodPressureRecord
import androidx.health.connect.client.records.BodyFatRecord
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
import androidx.health.connect.client.records.TotalCaloriesBurnedRecord
import androidx.health.connect.client.records.Vo2MaxRecord
import androidx.health.connect.client.records.WeightRecord
import kotlin.reflect.KClass

/**
 * Binds a single JS-facing statistics metric name (e.g. "sum", "avg") to the Health Connect
 * [AggregateMetric] it corresponds to, plus a function that extracts the resulting value as a
 * plain [Double] from an [AggregationResult].
 */
internal data class StatisticsMetricBinding(
    val metric: AggregateMetric<*>,
    val extract: (AggregationResult) -> Double?
)

/**
 * Single source of truth for the JS-facing "dataType" domain on Android, mirroring iOS's
 * `makeHealthDataTypeDescriptor` in `ios/HealthKitStatisticsSupport.swift`: the Health Connect
 * record type behind the data type, the label used in permission error messages, and the
 * statistics metric names the data type supports (empty for types `readStatistics` rejects
 * in JS, like sleep, heart rate variability, and oxygen saturation).
 *
 * Permissions ([healthConnectRecordTypeForDataType]), reads/saves, and `readStatistics` all
 * pull from this table, so adding a data type means adding exactly one entry here.
 */
internal data class HealthDataTypeDescriptor(
    val recordType: KClass<out Record>,
    val permissionLabel: String,
    val statisticsMetrics: Map<String, StatisticsMetricBinding> = emptyMap()
)

internal fun healthDataTypeDescriptorFor(dataType: String): HealthDataTypeDescriptor {
    return when (dataType) {
        "steps" -> HealthDataTypeDescriptor(
            recordType = StepsRecord::class,
            permissionLabel = "steps",
            statisticsMetrics = mapOf(
                "sum" to StatisticsMetricBinding(
                    metric = StepsRecord.COUNT_TOTAL,
                    extract = { result -> result[StepsRecord.COUNT_TOTAL]?.toDouble() }
                )
            )
        )
        "distance" -> HealthDataTypeDescriptor(
            recordType = DistanceRecord::class,
            permissionLabel = "distance",
            statisticsMetrics = mapOf(
                "sum" to StatisticsMetricBinding(
                    metric = DistanceRecord.DISTANCE_TOTAL,
                    extract = { result -> result[DistanceRecord.DISTANCE_TOTAL]?.inMeters }
                )
            )
        )
        "activeEnergyBurned" -> HealthDataTypeDescriptor(
            recordType = ActiveCaloriesBurnedRecord::class,
            permissionLabel = "active energy burned",
            statisticsMetrics = mapOf(
                "sum" to StatisticsMetricBinding(
                    metric = ActiveCaloriesBurnedRecord.ACTIVE_CALORIES_TOTAL,
                    extract = { result ->
                        result[ActiveCaloriesBurnedRecord.ACTIVE_CALORIES_TOTAL]?.inKilocalories
                    }
                )
            )
        )
        // Aggregate-only energy concepts: JS only routes readStatistics and read permissions
        // here. BasalMetabolicRateRecord stores an instantaneous kcal/day rate, so only its
        // BASAL_CALORIES_TOTAL aggregate yields energy; Health Connect estimates a rate from
        // body metrics (or demographic defaults) for sub-intervals without stored records.
        "basalEnergyBurned" -> HealthDataTypeDescriptor(
            recordType = BasalMetabolicRateRecord::class,
            permissionLabel = "basal energy burned",
            statisticsMetrics = mapOf(
                "sum" to StatisticsMetricBinding(
                    metric = BasalMetabolicRateRecord.BASAL_CALORIES_TOTAL,
                    extract = { result ->
                        result[BasalMetabolicRateRecord.BASAL_CALORIES_TOTAL]?.inKilocalories
                    }
                )
            )
        )
        "totalEnergyBurned" -> HealthDataTypeDescriptor(
            recordType = TotalCaloriesBurnedRecord::class,
            permissionLabel = "total energy burned",
            statisticsMetrics = mapOf(
                "sum" to StatisticsMetricBinding(
                    metric = TotalCaloriesBurnedRecord.ENERGY_TOTAL,
                    extract = { result ->
                        result[TotalCaloriesBurnedRecord.ENERGY_TOTAL]?.inKilocalories
                    }
                )
            )
        )
        "hydration" -> HealthDataTypeDescriptor(
            recordType = HydrationRecord::class,
            permissionLabel = "hydration",
            statisticsMetrics = mapOf(
                "sum" to StatisticsMetricBinding(
                    metric = HydrationRecord.VOLUME_TOTAL,
                    extract = { result -> result[HydrationRecord.VOLUME_TOTAL]?.inMilliliters }
                )
            )
        )
        "floorsClimbed" -> HealthDataTypeDescriptor(
            recordType = FloorsClimbedRecord::class,
            permissionLabel = "floors climbed",
            statisticsMetrics = mapOf(
                "sum" to StatisticsMetricBinding(
                    metric = FloorsClimbedRecord.FLOORS_CLIMBED_TOTAL,
                    extract = { result -> result[FloorsClimbedRecord.FLOORS_CLIMBED_TOTAL] }
                )
            )
        )
        "heartRate" -> HealthDataTypeDescriptor(
            recordType = HeartRateRecord::class,
            permissionLabel = "heart rate",
            statisticsMetrics = mapOf(
                "avg" to StatisticsMetricBinding(
                    metric = HeartRateRecord.BPM_AVG,
                    extract = { result -> result[HeartRateRecord.BPM_AVG]?.toDouble() }
                ),
                "min" to StatisticsMetricBinding(
                    metric = HeartRateRecord.BPM_MIN,
                    extract = { result -> result[HeartRateRecord.BPM_MIN]?.toDouble() }
                ),
                "max" to StatisticsMetricBinding(
                    metric = HeartRateRecord.BPM_MAX,
                    extract = { result -> result[HeartRateRecord.BPM_MAX]?.toDouble() }
                )
            )
        )
        "bloodPressure" -> HealthDataTypeDescriptor(
            recordType = BloodPressureRecord::class,
            permissionLabel = "blood pressure"
        )
        "bloodGlucose" -> HealthDataTypeDescriptor(
            recordType = BloodGlucoseRecord::class,
            permissionLabel = "blood glucose"
        )
        "bodyTemperature" -> HealthDataTypeDescriptor(
            recordType = BodyTemperatureRecord::class,
            permissionLabel = "body temperature"
        )
        "respiratoryRate" -> HealthDataTypeDescriptor(
            recordType = RespiratoryRateRecord::class,
            permissionLabel = "respiratory rate"
        )
        "bodyFat" -> HealthDataTypeDescriptor(
            recordType = BodyFatRecord::class,
            permissionLabel = "body fat"
        )
        "leanBodyMass" -> HealthDataTypeDescriptor(
            recordType = LeanBodyMassRecord::class,
            permissionLabel = "lean body mass"
        )
        "basalBodyTemperature" -> HealthDataTypeDescriptor(
            recordType = BasalBodyTemperatureRecord::class,
            permissionLabel = "basal body temperature"
        )
        "sleep" -> HealthDataTypeDescriptor(
            recordType = SleepSessionRecord::class,
            permissionLabel = "sleep"
        )
        "workout" -> HealthDataTypeDescriptor(
            recordType = ExerciseSessionRecord::class,
            permissionLabel = "workouts"
        )
        "bodyMass" -> HealthDataTypeDescriptor(
            recordType = WeightRecord::class,
            permissionLabel = "body mass",
            statisticsMetrics = mapOf(
                "avg" to StatisticsMetricBinding(
                    metric = WeightRecord.WEIGHT_AVG,
                    extract = { result -> result[WeightRecord.WEIGHT_AVG]?.inKilograms }
                ),
                "min" to StatisticsMetricBinding(
                    metric = WeightRecord.WEIGHT_MIN,
                    extract = { result -> result[WeightRecord.WEIGHT_MIN]?.inKilograms }
                ),
                "max" to StatisticsMetricBinding(
                    metric = WeightRecord.WEIGHT_MAX,
                    extract = { result -> result[WeightRecord.WEIGHT_MAX]?.inKilograms }
                )
            )
        )
        "restingHeartRate" -> HealthDataTypeDescriptor(
            recordType = RestingHeartRateRecord::class,
            permissionLabel = "resting heart rate",
            statisticsMetrics = mapOf(
                "avg" to StatisticsMetricBinding(
                    metric = RestingHeartRateRecord.BPM_AVG,
                    extract = { result -> result[RestingHeartRateRecord.BPM_AVG]?.toDouble() }
                ),
                "min" to StatisticsMetricBinding(
                    metric = RestingHeartRateRecord.BPM_MIN,
                    extract = { result -> result[RestingHeartRateRecord.BPM_MIN]?.toDouble() }
                ),
                "max" to StatisticsMetricBinding(
                    metric = RestingHeartRateRecord.BPM_MAX,
                    extract = { result -> result[RestingHeartRateRecord.BPM_MAX]?.toDouble() }
                )
            )
        )
        "heartRateVariability" -> HealthDataTypeDescriptor(
            recordType = HeartRateVariabilityRmssdRecord::class,
            permissionLabel = "heart rate variability"
        )
        "oxygenSaturation" -> HealthDataTypeDescriptor(
            recordType = OxygenSaturationRecord::class,
            permissionLabel = "oxygen saturation"
        )
        "height" -> HealthDataTypeDescriptor(
            recordType = HeightRecord::class,
            permissionLabel = "height",
            statisticsMetrics = mapOf(
                "avg" to StatisticsMetricBinding(
                    metric = HeightRecord.HEIGHT_AVG,
                    extract = { result -> result[HeightRecord.HEIGHT_AVG]?.inMeters }
                ),
                "min" to StatisticsMetricBinding(
                    metric = HeightRecord.HEIGHT_MIN,
                    extract = { result -> result[HeightRecord.HEIGHT_MIN]?.inMeters }
                ),
                "max" to StatisticsMetricBinding(
                    metric = HeightRecord.HEIGHT_MAX,
                    extract = { result -> result[HeightRecord.HEIGHT_MAX]?.inMeters }
                )
            )
        )
        "vo2Max" -> HealthDataTypeDescriptor(
            recordType = Vo2MaxRecord::class,
            permissionLabel = "VO2 max"
        )
        else -> throw IllegalArgumentException("Unsupported health data type: $dataType")
    }
}
