import type {
  AggregateOnlyHealthDataType,
  ChangeTrackedHealthDataType,
  HealthDataType,
} from '../HealthDataType'
import type { HealthPermission } from '../HealthPermission'
import type { HealthRecordIdentity } from '../HealthSampleIdentity'

const HEALTH_DATA_TYPES = new Set<string>([
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
  'nutrition',
] satisfies HealthDataType[])

const CHANGE_TRACKING_UNSUPPORTED_DATA_TYPES = new Set<HealthDataType>(['nutrition'])

const AGGREGATE_ONLY_DATA_TYPES = new Set<string>([
  'basalEnergyBurned',
  'totalEnergyBurned',
] satisfies AggregateOnlyHealthDataType[])

interface HealthPermissionCandidate {
  accessType?: unknown
  dataType?: unknown
}

function isHealthPermissionCandidate(value: unknown): value is HealthPermissionCandidate {
  return typeof value === 'object' && value !== null
}

function isHealthDataType(value: string): value is HealthDataType {
  return HEALTH_DATA_TYPES.has(value)
}

function isAggregateOnlyHealthDataType(value: string): value is AggregateOnlyHealthDataType {
  return AGGREGATE_ONLY_DATA_TYPES.has(value)
}

function isChangeTrackedHealthDataType(
  dataType: HealthDataType
): dataType is ChangeTrackedHealthDataType {
  return !CHANGE_TRACKING_UNSUPPORTED_DATA_TYPES.has(dataType)
}

export function assertPermissions(permissions: HealthPermission[]): void {
  if (permissions.length === 0) {
    throw new Error('At least one health permission is required')
  }
  permissions.forEach((permission, index) => {
    const candidate: unknown = permission
    if (
      !isHealthPermissionCandidate(candidate) ||
      (candidate.accessType !== 'read' && candidate.accessType !== 'write') ||
      typeof candidate.dataType !== 'string' ||
      (!isHealthDataType(candidate.dataType) && !isAggregateOnlyHealthDataType(candidate.dataType))
    ) {
      throw new Error(`permissions[${index}]: a supported read or write permission is required`)
    }
    if (candidate.accessType === 'write' && candidate.dataType === 'heartRateVariability') {
      throw new Error('permissions[' + index + ']: heartRateVariability is read-only')
    }
    if (candidate.accessType === 'write' && isAggregateOnlyHealthDataType(candidate.dataType)) {
      throw new Error(`permissions[${index}]: ${candidate.dataType} is an aggregate-only read type`)
    }
  })
}

export function parseHealthDataTypes(values: readonly string[], label: string): HealthDataType[] {
  return values.map((value, index) => {
    if (!isHealthDataType(value)) {
      throw new Error(`${label}[${index}]: unsupported health data type '${value}'`)
    }
    return value
  })
}

export function assertChangeTrackedHealthDataType(dataType: HealthDataType): void {
  if (CHANGE_TRACKING_UNSUPPORTED_DATA_TYPES.has(dataType)) {
    throw new Error(`Change tracking is not supported for '${dataType}' yet`)
  }
}

export function parseChangeTrackedHealthDataTypes(
  values: readonly string[],
  label: string
): ChangeTrackedHealthDataType[] {
  return parseHealthDataTypes(values, label).map((dataType, index) => {
    if (!isChangeTrackedHealthDataType(dataType)) {
      throw new Error(`${label}[${index}]: change tracking is not supported for '${dataType}' yet`)
    }
    return dataType
  })
}

export function dateToTimeMs(value: Date, message: string): number {
  if (!(value instanceof Date) || !Number.isFinite(value.getTime())) {
    throw new Error(message)
  }

  return value.getTime()
}

export function assertStartBeforeEnd(startTimeMs: number, endTimeMs: number, prefix = ''): void {
  if (startTimeMs >= endTimeMs) {
    throw new Error(`${prefix}startDate must be before endDate`)
  }
}

export function assertValidDate(value: Date, name: 'startDate' | 'endDate'): number {
  return dateToTimeMs(value, `A valid ${name} is required`)
}

export function assertValidSampleDate(value: Date, index: number, name: string): number {
  return dateToTimeMs(value, `samples[${index}]: a valid ${name} is required`)
}

export function assertSampleInterval(startTimeMs: number, endTimeMs: number, index: number): void {
  assertStartBeforeEnd(startTimeMs, endTimeMs, `samples[${index}]: `)
}

export function assertNonEmptySamples(samples: readonly unknown[]): void {
  if (samples.length === 0) {
    throw new Error('At least one sample is required')
  }
}

export function assertNonEmptySessions(sessions: readonly unknown[]): void {
  if (sessions.length === 0) {
    throw new Error('At least one sleep session is required')
  }
}

export function assertUniqueSampleSyncIds(samples: readonly { sync?: { id: string } }[]): void {
  const firstIndexById = new Map<string, number>()

  samples.forEach((sample, index) => {
    if (sample.sync === undefined) return

    const previousIndex = firstIndexById.get(sample.sync.id)
    if (previousIndex !== undefined) {
      throw new Error(
        `samples[${index}]: sync.id duplicates samples[${previousIndex}].sync.id within this save call`
      )
    }

    firstIndexById.set(sample.sync.id, index)
  })
}

export function assertRecordIdentities(records: readonly HealthRecordIdentity[]): void {
  if (records.length === 0) {
    throw new Error('At least one record identity is required')
  }

  const ids = new Set<string>()
  records.forEach((record, index) => {
    if (
      typeof record !== 'object' ||
      record === null ||
      record.kind !== 'record' ||
      typeof record.id !== 'string' ||
      record.id.trim() === ''
    ) {
      throw new Error(`records[${index}]: an independently deletable record identity is required`)
    }

    if (ids.has(record.id)) {
      throw new Error(`records[${index}]: duplicate record identity '${record.id}'`)
    }
    ids.add(record.id)
  })
}

export function assertChangesToken(changesToken: string): void {
  if (typeof changesToken !== 'string' || changesToken.trim() === '') {
    throw new Error('changesToken must be a non-empty string')
  }
}

export function assertSamplePositiveInteger(value: number, index: number, name: string): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`samples[${index}]: ${name} must be a positive integer`)
  }
}

export function assertSampleNonNegativeNumber(value: number, index: number, name: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`samples[${index}]: ${name} must be a non-negative number`)
  }
}

export function assertSampleGreaterThanZero(value: number, index: number, name: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`samples[${index}]: ${name} must be greater than 0`)
  }
}

export function assertSampleBetween(
  value: number,
  min: number,
  max: number,
  index: number,
  name: string
): void {
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new Error(`samples[${index}]: ${name} must be between ${min} and ${max}`)
  }
}

export function assertSampleMaxValue(
  value: number,
  max: number,
  index: number,
  name: string
): void {
  if (value > max) {
    throw new Error(`samples[${index}]: ${name} must not exceed ${max}`)
  }
}
