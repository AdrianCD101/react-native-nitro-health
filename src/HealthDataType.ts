/**
 * Health data type supported by authorization, raw reads, and change tracking.
 *
 * @see {@linkcode NitroHealth.requestAuthorization}
 * @see {@linkcode NitroHealth.createChangesToken}
 */
export type HealthDataType =
  | 'steps'
  | 'heartRate'
  | 'restingHeartRate'
  | 'heartRateVariability'
  | 'distance'
  | 'activeEnergyBurned'
  | 'oxygenSaturation'
  | 'height'
  | 'sleep'
  | 'bodyMass'
  | 'workout'
