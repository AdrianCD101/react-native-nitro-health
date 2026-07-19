package com.nitrohealth

import androidx.health.connect.client.aggregate.AggregateMetric
import androidx.health.connect.client.aggregate.AggregationResult
import androidx.health.connect.client.records.ActiveCaloriesBurnedRecord
import androidx.health.connect.client.records.DistanceRecord
import androidx.health.connect.client.records.HeartRateRecord
import androidx.health.connect.client.records.Record
import androidx.health.connect.client.records.StepsRecord
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
 * Describes how a `readStatistics` data type maps onto Health Connect: which record type read
 * permission is required, the label used in permission error messages, and the set of metric
 * names that data type supports.
 */
internal data class StatisticsDescriptor(
    val recordType: KClass<out Record>,
    val permissionLabel: String,
    val metrics: Map<String, StatisticsMetricBinding>
)

internal fun statisticsDescriptorForDataType(dataType: String): StatisticsDescriptor {
    return when (dataType) {
        "steps" -> StatisticsDescriptor(
            recordType = StepsRecord::class,
            permissionLabel = "steps",
            metrics = mapOf(
                "sum" to StatisticsMetricBinding(
                    metric = StepsRecord.COUNT_TOTAL,
                    extract = { result -> result[StepsRecord.COUNT_TOTAL]?.toDouble() }
                )
            )
        )
        "distance" -> StatisticsDescriptor(
            recordType = DistanceRecord::class,
            permissionLabel = "distance",
            metrics = mapOf(
                "sum" to StatisticsMetricBinding(
                    metric = DistanceRecord.DISTANCE_TOTAL,
                    extract = { result -> result[DistanceRecord.DISTANCE_TOTAL]?.inMeters }
                )
            )
        )
        "activeEnergyBurned" -> StatisticsDescriptor(
            recordType = ActiveCaloriesBurnedRecord::class,
            permissionLabel = "active energy burned",
            metrics = mapOf(
                "sum" to StatisticsMetricBinding(
                    metric = ActiveCaloriesBurnedRecord.ACTIVE_CALORIES_TOTAL,
                    extract = { result ->
                        result[ActiveCaloriesBurnedRecord.ACTIVE_CALORIES_TOTAL]?.inKilocalories
                    }
                )
            )
        )
        "heartRate" -> StatisticsDescriptor(
            recordType = HeartRateRecord::class,
            permissionLabel = "heart rate",
            metrics = mapOf(
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
        "bodyMass" -> StatisticsDescriptor(
            recordType = WeightRecord::class,
            permissionLabel = "body mass",
            metrics = mapOf(
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
        else -> throw IllegalArgumentException("Unsupported health data type for statistics: $dataType")
    }
}
