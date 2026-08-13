import type {
  AggregateOnlyHealthDataType,
  HealthDataType,
  HealthPermission,
  WritableHealthDataType,
} from 'react-native-nitro-health'

export const healthDataTypes: HealthDataType[] = [
  'steps',
  'heartRate',
  'bloodPressure',
  'bloodGlucose',
  'bodyTemperature',
  'respiratoryRate',
  'bodyFat',
  'leanBodyMass',
  'basalBodyTemperature',
  'restingHeartRate',
  'heartRateVariability',
  'distance',
  'activeEnergyBurned',
  'hydration',
  'floorsClimbed',
  'oxygenSaturation',
  'height',
  'vo2Max',
  'sleep',
  'bodyMass',
  'workout',
]

// Read-only aggregate energy concepts; no raw reads or writes exist for these.
export const aggregateOnlyDataTypes: AggregateOnlyHealthDataType[] = [
  'basalEnergyBurned',
  'totalEnergyBurned',
]

export const writableDataTypes: WritableHealthDataType[] = [
  'steps',
  'heartRate',
  'bloodPressure',
  'bloodGlucose',
  'bodyTemperature',
  'respiratoryRate',
  'bodyFat',
  'leanBodyMass',
  'basalBodyTemperature',
  'restingHeartRate',
  'distance',
  'activeEnergyBurned',
  'hydration',
  'floorsClimbed',
  'oxygenSaturation',
  'height',
  'vo2Max',
  'sleep',
  'bodyMass',
  'workout',
]

export const allHealthPermissions: HealthPermission[] = [
  ...healthDataTypes.map((dataType) => ({ accessType: 'read' as const, dataType })),
  ...aggregateOnlyDataTypes.map((dataType) => ({ accessType: 'read' as const, dataType })),
  ...writableDataTypes.map((dataType) => ({ accessType: 'write' as const, dataType })),
]
