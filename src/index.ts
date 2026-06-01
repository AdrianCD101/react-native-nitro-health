import { NitroModules } from 'react-native-nitro-modules'
import type { NitroHealth as NitroHealthSpec } from './specs/nitro-health.nitro'
import type { DailyStepTotal } from './DailyStepTotal'
import type { HealthAuthorizationResult } from './HealthAuthorizationResult'
import type { HealthDateRangeQuery } from './HealthDateRangeQuery'
import type { HealthPermission } from './HealthPermission'
import type { HealthTimeRangeQuery } from './HealthTimeRangeQuery'
import type { HeartRateSample } from './HeartRateSample'
import type { HeartRateStatistics } from './HeartRateStatistics'
import type { NativeHealthDateRangeQuery } from './NativeHealthDateRangeQuery'
import type { NativeHealthTimeRangeQuery } from './NativeHealthTimeRangeQuery'
import type { NativeHeartRateSample } from './NativeHeartRateSample'
import type { NativeHeartRateStatistics } from './NativeHeartRateStatistics'
import type { NativeStepSample } from './NativeStepSample'
import type { StepSample } from './StepSample'

export type { AuthorizationRequestStatus } from './AuthorizationRequestStatus'
export type { DailyStepTotal } from './DailyStepTotal'
export type { HealthAuthorizationResult } from './HealthAuthorizationResult'
export type { HealthAuthorizationStatus } from './HealthAuthorizationStatus'
export type { HealthAvailabilityStatus } from './HealthAvailabilityStatus'
export type { HealthDataType } from './HealthDataType'
export type { HealthDateRangeQuery } from './HealthDateRangeQuery'
export type { HealthPermission } from './HealthPermission'
export type { HealthPermissionAccessType } from './HealthPermissionAccessType'
export type { HealthTimeRangeQuery } from './HealthTimeRangeQuery'
export type { HeartRateSample } from './HeartRateSample'
export type { HeartRateStatistics } from './HeartRateStatistics'
export type { NativeHealthAuthorizationResult } from './NativeHealthAuthorizationResult'
export type { NativeHealthDateRangeQuery } from './NativeHealthDateRangeQuery'
export type { NativeHealthTimeRangeQuery } from './NativeHealthTimeRangeQuery'
export type { NativeHealthPermission } from './NativeHealthPermission'
export type { NativeHeartRateSample } from './NativeHeartRateSample'
export type { NativeHeartRateStatistics } from './NativeHeartRateStatistics'
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

function makeNativeTimeRangeQuery(query: HealthTimeRangeQuery): NativeHealthTimeRangeQuery {
  const startTimeMs = assertValidDate(query.startDate, 'startDate')
  const endTimeMs = assertValidDate(query.endDate, 'endDate')

  if (startTimeMs >= endTimeMs) {
    throw new Error('startDate must be before endDate')
  }

  return {
    startTimeMs,
    endTimeMs,
  }
}

function makeStepSample(sample: NativeStepSample): StepSample {
  return {
    startDate: new Date(sample.startTimeMs),
    endDate: new Date(sample.endTimeMs),
    count: sample.count,
  }
}

function makeHeartRateSample(sample: NativeHeartRateSample): HeartRateSample {
  return {
    date: new Date(sample.timeMs),
    bpm: sample.bpm,
    source: sample.source,
  }
}

function makeHeartRateStatistics(statistics: NativeHeartRateStatistics): HeartRateStatistics {
  return {
    average: statistics.average,
    min: statistics.min,
    max: statistics.max,
  }
}

export type NitroHealth = Omit<
  NitroHealthSpec,
  | 'getRequestStatusForAuthorization'
  | 'readSteps'
  | 'readDailyStepTotals'
  | 'readHeartRate'
  | 'readHeartRateStatistics'
  | 'requestAuthorization'
> & {
  getRequestStatusForAuthorization(
    permissions: HealthPermission[]
  ): ReturnType<NitroHealthSpec['getRequestStatusForAuthorization']>
  readSteps(query: HealthDateRangeQuery): Promise<StepSample[]>
  readDailyStepTotals(query: HealthDateRangeQuery): Promise<DailyStepTotal[]>
  readHeartRate(query: HealthDateRangeQuery): Promise<HeartRateSample[]>
  readHeartRateStatistics(query: HealthTimeRangeQuery): Promise<HeartRateStatistics>
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
  async readDailyStepTotals(query) {
    const samples = await NitroHealthNative.readDailyStepTotals(makeNativeDateRangeQuery(query))

    return samples.map(makeStepSample)
  },
  async readHeartRate(query) {
    const samples = await NitroHealthNative.readHeartRate(makeNativeDateRangeQuery(query))

    return samples.map(makeHeartRateSample)
  },
  async readHeartRateStatistics(query) {
    const statistics = await NitroHealthNative.readHeartRateStatistics(
      makeNativeTimeRangeQuery(query)
    )

    return makeHeartRateStatistics(statistics)
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
