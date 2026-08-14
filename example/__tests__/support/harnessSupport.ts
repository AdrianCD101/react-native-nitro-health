/**
 * Shared fixtures and helpers for the NitroHealth harness suites
 * (NitroHealth.{permissions,reads,saves,statistics}.harness.ts).
 *
 * This module is not a test file: the harness testMatch only picks up `*.harness.*` names,
 * and the regular Jest config ignores `__tests__/support/` entirely.
 */
import { Platform } from 'react-native'
import { NitroHealth } from 'react-native-nitro-health'
import type { HealthPermission } from 'react-native-nitro-health'

export const stepsReadPermission: HealthPermission[] = [{ accessType: 'read', dataType: 'steps' }]
export const distanceReadPermission: HealthPermission[] = [
  { accessType: 'read', dataType: 'distance' },
]
export const activeEnergyReadPermission: HealthPermission[] = [
  { accessType: 'read', dataType: 'activeEnergyBurned' },
]
export const activeEnergyWritePermission: HealthPermission[] = [
  { accessType: 'write', dataType: 'activeEnergyBurned' },
]
export const basalEnergyReadPermission: HealthPermission[] = [
  { accessType: 'read', dataType: 'basalEnergyBurned' },
]
export const totalEnergyReadPermission: HealthPermission[] = [
  { accessType: 'read', dataType: 'totalEnergyBurned' },
]
export const hydrationReadPermission: HealthPermission[] = [
  { accessType: 'read', dataType: 'hydration' },
]
export const hydrationWritePermission: HealthPermission[] = [
  { accessType: 'write', dataType: 'hydration' },
]
export const floorsClimbedReadPermission: HealthPermission[] = [
  { accessType: 'read', dataType: 'floorsClimbed' },
]
export const floorsClimbedWritePermission: HealthPermission[] = [
  { accessType: 'write', dataType: 'floorsClimbed' },
]
export const heartRateReadPermission: HealthPermission[] = [
  { accessType: 'read', dataType: 'heartRate' },
]
export const bloodPressureReadPermission: HealthPermission[] = [
  { accessType: 'read', dataType: 'bloodPressure' },
]
export const bloodPressureWritePermission: HealthPermission[] = [
  { accessType: 'write', dataType: 'bloodPressure' },
]
export const bloodGlucoseReadPermission: HealthPermission[] = [
  { accessType: 'read', dataType: 'bloodGlucose' },
]
export const bloodGlucoseWritePermission: HealthPermission[] = [
  { accessType: 'write', dataType: 'bloodGlucose' },
]
export const bodyTemperatureReadPermission: HealthPermission[] = [
  { accessType: 'read', dataType: 'bodyTemperature' },
]
export const bodyTemperatureWritePermission: HealthPermission[] = [
  { accessType: 'write', dataType: 'bodyTemperature' },
]
export const respiratoryRateReadPermission: HealthPermission[] = [
  { accessType: 'read', dataType: 'respiratoryRate' },
]
export const respiratoryRateWritePermission: HealthPermission[] = [
  { accessType: 'write', dataType: 'respiratoryRate' },
]
export const vo2MaxReadPermission: HealthPermission[] = [{ accessType: 'read', dataType: 'vo2Max' }]
export const vo2MaxWritePermission: HealthPermission[] = [
  { accessType: 'write', dataType: 'vo2Max' },
]
export const bodyFatReadPermission: HealthPermission[] = [
  { accessType: 'read', dataType: 'bodyFat' },
]
export const bodyFatWritePermission: HealthPermission[] = [
  { accessType: 'write', dataType: 'bodyFat' },
]
export const leanBodyMassReadPermission: HealthPermission[] = [
  { accessType: 'read', dataType: 'leanBodyMass' },
]
export const leanBodyMassWritePermission: HealthPermission[] = [
  { accessType: 'write', dataType: 'leanBodyMass' },
]
export const basalBodyTemperatureReadPermission: HealthPermission[] = [
  { accessType: 'read', dataType: 'basalBodyTemperature' },
]
export const basalBodyTemperatureWritePermission: HealthPermission[] = [
  { accessType: 'write', dataType: 'basalBodyTemperature' },
]
export const sleepReadPermission: HealthPermission[] = [{ accessType: 'read', dataType: 'sleep' }]
export const sleepWritePermission: HealthPermission[] = [{ accessType: 'write', dataType: 'sleep' }]
export const bodyMassReadPermission: HealthPermission[] = [
  { accessType: 'read', dataType: 'bodyMass' },
]
export const restingHeartRateReadPermission: HealthPermission[] = [
  { accessType: 'read', dataType: 'restingHeartRate' },
]
export const heartRateVariabilityReadPermission: HealthPermission[] = [
  { accessType: 'read', dataType: 'heartRateVariability' },
]
export const oxygenSaturationReadPermission: HealthPermission[] = [
  { accessType: 'read', dataType: 'oxygenSaturation' },
]
export const heightReadPermission: HealthPermission[] = [{ accessType: 'read', dataType: 'height' }]
export const workoutReadPermission: HealthPermission[] = [
  { accessType: 'read', dataType: 'workout' },
]
export const workoutWritePermission: HealthPermission[] = [
  { accessType: 'write', dataType: 'workout' },
]

export const emptyRange = {
  startDate: new Date('2000-01-01T00:00:00.000Z'),
  endDate: new Date('2000-01-02T00:00:00.000Z'),
}
export const saveInterval = {
  startDate: new Date('2001-06-01T09:00:00.000Z'),
  endDate: new Date('2001-06-01T09:30:00.000Z'),
}
export const saveReadRange = {
  startDate: new Date('2001-06-01T00:00:00.000Z'),
  endDate: new Date('2001-06-02T00:00:00.000Z'),
}
// Dedicated to NitroHealth.deletes.harness.ts: the deletes suite removes data inside these
// ranges, so they must never overlap saveInterval/saveReadRange (or any other suite's fixtures).
export const deleteInterval = {
  startDate: new Date('2002-06-01T09:00:00.000Z'),
  endDate: new Date('2002-06-01T09:30:00.000Z'),
}
export const deleteReadRange = {
  startDate: new Date('2002-06-01T00:00:00.000Z'),
  endDate: new Date('2002-06-02T00:00:00.000Z'),
}
export const last7DaysRange = {
  startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  endDate: new Date(),
}
export const lastDayRange = {
  startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
  endDate: new Date(),
}

export async function requireVerifiedPermissions(permissions: HealthPermission[]): Promise<true> {
  const result = await NitroHealth.getPermissionStatuses(permissions)
  if (result.status === 'unavailable') {
    throw new Error('Harness prerequisite failed: health data is unavailable')
  }

  if (
    result.statuses.length !== permissions.length ||
    result.statuses.some(
      ({ permission }, index) =>
        permission.accessType !== permissions[index]?.accessType ||
        permission.dataType !== permissions[index]?.dataType
    )
  ) {
    throw new Error('Harness prerequisite failed: permission statuses did not match the request')
  }

  const unmet = result.statuses.filter(
    ({ permission, status }) =>
      status !== 'granted' &&
      !(Platform.OS === 'ios' && permission.accessType === 'read' && status === 'unverifiable')
  )
  if (unmet.length > 0) {
    const details = unmet
      .map(({ permission, status }) => `${permission.accessType}:${permission.dataType}=${status}`)
      .join(', ')
    throw new Error(
      `Harness prerequisite failed: required permissions are not granted (${details})`
    )
  }

  return true
}

export async function hasVerifiedPermissions(permissions: HealthPermission[]): Promise<true> {
  return requireVerifiedPermissions(permissions)
}

export function assertConclusiveRead(samples: readonly unknown[]): void {
  if (Platform.OS === 'ios' && samples.length === 0) {
    throw new Error(
      'Harness prerequisite failed: HealthKit returned no data after a write; verify read authorization'
    )
  }
}
