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
  | 'oxygenSaturation'
  | 'height'
  | 'sleep'
  | 'bodyMass'
  | 'workout'

/** Health data type that can be written portably. */
export type WritableHealthDataType = Exclude<HealthDataType, 'heartRateVariability'>
