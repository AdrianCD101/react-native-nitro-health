/**
 * Health data type supported by authorization, raw reads, and change tracking.
 *
 * @see {@linkcode NitroHealth.requestAuthorization}
 * @see {@linkcode NitroHealth.createChangesToken}
 * @see {@linkcode NitroHealth.configureBackgroundChanges}
 */
export type HealthDataType =
  | 'steps'
  | 'heartRate'
  | 'bloodPressure'
  | 'bloodGlucose'
  | 'bodyTemperature'
  | 'respiratoryRate'
  | 'bodyFat'
  | 'leanBodyMass'
  | 'basalBodyTemperature'
  | 'restingHeartRate'
  | 'heartRateVariability'
  | 'distance'
  | 'activeEnergyBurned'
  | 'hydration'
  | 'floorsClimbed'
  | 'oxygenSaturation'
  | 'height'
  | 'vo2Max'
  | 'sleep'
  | 'bodyMass'
  | 'workout'
  | 'nutrition'

/** Health data type that can be written portably. */
export type WritableHealthDataType = Exclude<HealthDataType, 'heartRateVariability'>

/**
 * Health data type supported by change tracking and background change delivery.
 *
 * `nutrition` is excluded until HealthKit anchored-query behavior over food correlations
 * is verified; requesting it rejects loudly rather than delivering incomplete changes.
 */
export type ChangeTrackedHealthDataType = Exclude<HealthDataType, 'nutrition'>

/**
 * Energy concept that exists only as an aggregate: HealthKit has no total-energy sample type and
 * Health Connect stores basal metabolic rate rather than basal-energy intervals, so neither type
 * supports portable raw reads or writes — only bucketed sums.
 */
export type AggregateOnlyHealthDataType = 'basalEnergyBurned' | 'totalEnergyBurned'

/** Data type accepted by {@linkcode NitroHealth.readStatistics}. */
export type HealthStatisticsDataType = HealthDataType | AggregateOnlyHealthDataType

/** Data type accepted by read permissions, including aggregate-only energy concepts. */
export type HealthPermissionDataType = HealthDataType | AggregateOnlyHealthDataType
