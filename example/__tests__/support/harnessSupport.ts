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
export const heartRateReadPermission: HealthPermission[] = [
  { accessType: 'read', dataType: 'heartRate' },
]
export const sleepReadPermission: HealthPermission[] = [{ accessType: 'read', dataType: 'sleep' }]
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

export async function isPermissionUnnecessary(permissions: HealthPermission[]): Promise<boolean> {
  return (await NitroHealth.getRequestStatusForAuthorization(permissions)) === 'unnecessary'
}

// 'unnecessary' only means the user has already been asked (they may have denied on iOS).
// For round-trip tests, resolve the grant silently via requestAuthorization — it never opens
// a prompt once the request status is 'unnecessary'. Note this can only verify WRITE grants:
// on iOS, read permissions always land in unverifiablePermissions (HealthKit hides read
// denials by design), so a denied read still passes this check and simply yields empty reads.
export async function hasVerifiedPermissions(permissions: HealthPermission[]): Promise<boolean> {
  if (!(await isPermissionUnnecessary(permissions))) {
    return false
  }

  const result = await NitroHealth.requestAuthorization(permissions)

  return result.deniedPermissions.length === 0
}

// On iOS a denied read permission is indistinguishable from an empty store: HealthKit returns
// no samples rather than an error. When a round-trip read comes back empty on iOS, treat the
// result as inconclusive (read likely denied) instead of failing the assertion. On Android
// read denials throw, so an empty read there is a real failure.
export function isInconclusiveRead(samples: readonly unknown[]): boolean {
  return Platform.OS === 'ios' && samples.length === 0
}
