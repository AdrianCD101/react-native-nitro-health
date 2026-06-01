import { NitroModules } from 'react-native-nitro-modules'
import type { NitroHealth as NitroHealthSpec } from './specs/nitro-health.nitro'
import type { HealthAuthorizationResult } from './HealthAuthorizationResult'
import type { HealthDateRangeQuery } from './HealthDateRangeQuery'
import type { HealthPermission } from './HealthPermission'
import type { NativeHealthDateRangeQuery } from './NativeHealthDateRangeQuery'
import type { NativeStepSample } from './NativeStepSample'
import type { StepSample } from './StepSample'

export type { AuthorizationRequestStatus } from './AuthorizationRequestStatus'
export type { HealthAuthorizationResult } from './HealthAuthorizationResult'
export type { HealthAuthorizationStatus } from './HealthAuthorizationStatus'
export type { HealthAvailabilityStatus } from './HealthAvailabilityStatus'
export type { HealthDataType } from './HealthDataType'
export type { HealthDateRangeQuery } from './HealthDateRangeQuery'
export type { HealthPermission } from './HealthPermission'
export type { HealthPermissionAccessType } from './HealthPermissionAccessType'
export type { NativeHealthAuthorizationResult } from './NativeHealthAuthorizationResult'
export type { NativeHealthDateRangeQuery } from './NativeHealthDateRangeQuery'
export type { NativeHealthPermission } from './NativeHealthPermission'
export type { NativeStepSample } from './NativeStepSample'
export type { NitroHealth as NitroHealthSpec } from './specs/nitro-health.nitro'
export type { StepSample } from './StepSample'

const NitroHealthNative = NitroModules.createHybridObject<NitroHealthSpec>('NitroHealth')

function assertPermissions(permissions: HealthPermission[]): void {
  if (permissions.length === 0) {
    throw new Error('At least one health permission is required')
  }
}

function assertValidDate(value: Date, name: 'startDate' | 'endDate'): number {
  if (!(value instanceof Date)) {
    throw new Error(`A valid ${name} is required`)
  }

  const timeMs = value.getTime()

  if (!Number.isFinite(timeMs)) {
    throw new Error(`A valid ${name} is required`)
  }

  return timeMs
}

function makeNativeDateRangeQuery(query: HealthDateRangeQuery): NativeHealthDateRangeQuery {
  const startTimeMs = assertValidDate(query.startDate, 'startDate')
  const endTimeMs = assertValidDate(query.endDate, 'endDate')
  const limit = query.limit ?? 1000

  if (startTimeMs >= endTimeMs) {
    throw new Error('startDate must be before endDate')
  }

  if (!Number.isInteger(limit) || limit <= 0) {
    throw new Error('limit must be a positive integer')
  }

  return {
    startTimeMs,
    endTimeMs,
    limit,
    ascending: query.ascending ?? true,
  }
}

function makeStepSample(sample: NativeStepSample): StepSample {
  return {
    startDate: new Date(sample.startTimeMs),
    endDate: new Date(sample.endTimeMs),
    count: sample.count,
  }
}

export type NitroHealth = Omit<
  NitroHealthSpec,
  'getRequestStatusForAuthorization' | 'readSteps' | 'requestAuthorization'
> & {
  getRequestStatusForAuthorization(
    permissions: HealthPermission[]
  ): ReturnType<NitroHealthSpec['getRequestStatusForAuthorization']>
  readSteps(query: HealthDateRangeQuery): Promise<StepSample[]>
  requestAuthorization(permissions: HealthPermission[]): Promise<HealthAuthorizationResult>
}

export const NitroHealth: NitroHealth = {
  get name() {
    return NitroHealthNative.name
  },
  toString() {
    return NitroHealthNative.toString()
  },
  equals(other) {
    return NitroHealthNative.equals(other)
  },
  dispose() {
    NitroHealthNative.dispose()
  },
  isAvailable() {
    return NitroHealthNative.isAvailable()
  },
  getAvailabilityStatus() {
    return NitroHealthNative.getAvailabilityStatus()
  },
  openHealthConnectInstall() {
    return NitroHealthNative.openHealthConnectInstall()
  },
  openHealthSettings() {
    return NitroHealthNative.openHealthSettings()
  },
  async readSteps(query) {
    const samples = await NitroHealthNative.readSteps(makeNativeDateRangeQuery(query))

    return samples.map(makeStepSample)
  },
  async getRequestStatusForAuthorization(permissions) {
    assertPermissions(permissions)
    return NitroHealthNative.getRequestStatusForAuthorization(permissions)
  },
  async requestAuthorization(permissions) {
    assertPermissions(permissions)
    return NitroHealthNative.requestAuthorization(permissions) as Promise<HealthAuthorizationResult>
  },
}
