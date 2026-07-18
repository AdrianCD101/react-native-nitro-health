import { NitroModules } from 'react-native-nitro-modules'
import type { NitroHealth as NitroHealthSpec } from './specs/nitro-health.nitro'
import type { ActiveEnergyBurnedSample } from './ActiveEnergyBurnedSample'
import type { ActiveEnergyBurnedSampleInput } from './ActiveEnergyBurnedSampleInput'
import type { BodyMassSample } from './BodyMassSample'
import type { BodyMassSampleInput } from './BodyMassSampleInput'
import type { DailyActiveEnergyBurnedTotal } from './DailyActiveEnergyBurnedTotal'
import type { DailyDistanceTotal } from './DailyDistanceTotal'
import type { DailyStepTotal } from './DailyStepTotal'
import type { DistanceSample } from './DistanceSample'
import type { DistanceSampleInput } from './DistanceSampleInput'
import type { HealthAuthorizationResult } from './HealthAuthorizationResult'
import type { HealthDateRangeQuery } from './HealthDateRangeQuery'
import type { HealthPermission } from './HealthPermission'
import type { HealthTimeRangeQuery } from './HealthTimeRangeQuery'
import type { HeartRateSample } from './HeartRateSample'
import type { HeartRateSampleInput } from './HeartRateSampleInput'
import type { HeartRateStatistics } from './HeartRateStatistics'
import type { NativeActiveEnergyBurnedSample } from './NativeActiveEnergyBurnedSample'
import type { NativeActiveEnergyBurnedSampleInput } from './NativeActiveEnergyBurnedSampleInput'
import type { NativeBodyMassSample } from './NativeBodyMassSample'
import type { NativeBodyMassSampleInput } from './NativeBodyMassSampleInput'
import type { NativeDistanceSample } from './NativeDistanceSample'
import type { NativeDistanceSampleInput } from './NativeDistanceSampleInput'
import type { NativeHealthDateRangeQuery } from './NativeHealthDateRangeQuery'
import type { NativeHealthTimeRangeQuery } from './NativeHealthTimeRangeQuery'
import type { NativeHeartRateSample } from './NativeHeartRateSample'
import type { NativeHeartRateSampleInput } from './NativeHeartRateSampleInput'
import type { NativeHeartRateStatistics } from './NativeHeartRateStatistics'
import type { NativeSleepSample } from './NativeSleepSample'
import type { NativeStepSample } from './NativeStepSample'
import type { NativeStepSampleInput } from './NativeStepSampleInput'
import type { SleepSample } from './SleepSample'
import type { StepSample } from './StepSample'
import type { StepSampleInput } from './StepSampleInput'

export type { ActiveEnergyBurnedSample } from './ActiveEnergyBurnedSample'
export type { ActiveEnergyBurnedSampleInput } from './ActiveEnergyBurnedSampleInput'
export type { AuthorizationRequestStatus } from './AuthorizationRequestStatus'
export type { BodyMassSample } from './BodyMassSample'
export type { BodyMassSampleInput } from './BodyMassSampleInput'
export type { DailyActiveEnergyBurnedTotal } from './DailyActiveEnergyBurnedTotal'
export type { DailyDistanceTotal } from './DailyDistanceTotal'
export type { DailyStepTotal } from './DailyStepTotal'
export type { DistanceSample } from './DistanceSample'
export type { DistanceSampleInput } from './DistanceSampleInput'
export type { HealthAuthorizationResult } from './HealthAuthorizationResult'
export type { HealthAuthorizationStatus } from './HealthAuthorizationStatus'
export type { HealthAvailabilityStatus } from './HealthAvailabilityStatus'
export type { HealthDataType } from './HealthDataType'
export type { HealthDateRangeQuery } from './HealthDateRangeQuery'
export type { HealthPermission } from './HealthPermission'
export type { HealthPermissionAccessType } from './HealthPermissionAccessType'
export type { HealthTimeRangeQuery } from './HealthTimeRangeQuery'
export type { HeartRateSample } from './HeartRateSample'
export type { HeartRateSampleInput } from './HeartRateSampleInput'
export type { HeartRateStatistics } from './HeartRateStatistics'
export type { NativeActiveEnergyBurnedSample } from './NativeActiveEnergyBurnedSample'
export type { NativeActiveEnergyBurnedSampleInput } from './NativeActiveEnergyBurnedSampleInput'
export type { NativeBodyMassSample } from './NativeBodyMassSample'
export type { NativeBodyMassSampleInput } from './NativeBodyMassSampleInput'
export type { NativeDistanceSample } from './NativeDistanceSample'
export type { NativeDistanceSampleInput } from './NativeDistanceSampleInput'
export type { NativeHealthAuthorizationResult } from './NativeHealthAuthorizationResult'
export type { NativeHealthDateRangeQuery } from './NativeHealthDateRangeQuery'
export type { NativeHealthTimeRangeQuery } from './NativeHealthTimeRangeQuery'
export type { NativeHealthPermission } from './NativeHealthPermission'
export type { NativeHeartRateSample } from './NativeHeartRateSample'
export type { NativeHeartRateSampleInput } from './NativeHeartRateSampleInput'
export type { NativeHeartRateStatistics } from './NativeHeartRateStatistics'
export type { NativeSleepSample } from './NativeSleepSample'
export type { NativeStepSample } from './NativeStepSample'
export type { NativeStepSampleInput } from './NativeStepSampleInput'
export type { NitroHealth as NitroHealthSpec } from './specs/nitro-health.nitro'
export type { SleepSample } from './SleepSample'
export type { SleepStage } from './SleepStage'
export type { StepSample } from './StepSample'
export type { StepSampleInput } from './StepSampleInput'

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

function assertNonEmptySamples(samples: readonly unknown[]): void {
  if (samples.length === 0) {
    throw new Error('At least one sample is required')
  }
}

function assertValidSampleDate(value: Date, index: number, name: string): number {
  if (!(value instanceof Date)) {
    throw new Error(`samples[${index}]: a valid ${name} is required`)
  }

  const timeMs = value.getTime()

  if (!Number.isFinite(timeMs)) {
    throw new Error(`samples[${index}]: a valid ${name} is required`)
  }

  return timeMs
}

function assertSampleInterval(startTimeMs: number, endTimeMs: number, index: number): void {
  if (startTimeMs >= endTimeMs) {
    throw new Error(`samples[${index}]: startDate must be before endDate`)
  }
}

// Upper bounds mirror Health Connect's record constraints (connect-client 1.1.0) so inputs
// behave identically on both platforms instead of passing on iOS and throwing a raw
// IllegalArgumentException on Android.
const MAX_STEP_COUNT = 1_000_000
const MAX_DISTANCE_METERS = 1_000_000
const MAX_KILOCALORIES = 1_000_000
const MIN_BPM = 1
const MAX_BPM = 300
const MAX_KILOGRAMS = 1_000

function makeNativeStepSampleInput(sample: StepSampleInput, index: number): NativeStepSampleInput {
  const startTimeMs = assertValidSampleDate(sample.startDate, index, 'startDate')
  const endTimeMs = assertValidSampleDate(sample.endDate, index, 'endDate')

  assertSampleInterval(startTimeMs, endTimeMs, index)

  if (!Number.isInteger(sample.count) || sample.count <= 0) {
    throw new Error(`samples[${index}]: count must be a positive integer`)
  }

  if (sample.count > MAX_STEP_COUNT) {
    throw new Error(`samples[${index}]: count must not exceed ${MAX_STEP_COUNT}`)
  }

  return {
    startTimeMs,
    endTimeMs,
    count: sample.count,
  }
}

function makeNativeDistanceSampleInput(
  sample: DistanceSampleInput,
  index: number
): NativeDistanceSampleInput {
  const startTimeMs = assertValidSampleDate(sample.startDate, index, 'startDate')
  const endTimeMs = assertValidSampleDate(sample.endDate, index, 'endDate')

  assertSampleInterval(startTimeMs, endTimeMs, index)

  if (!Number.isFinite(sample.distanceMeters) || sample.distanceMeters < 0) {
    throw new Error(`samples[${index}]: distanceMeters must be a non-negative number`)
  }

  if (sample.distanceMeters > MAX_DISTANCE_METERS) {
    throw new Error(`samples[${index}]: distanceMeters must not exceed ${MAX_DISTANCE_METERS}`)
  }

  return {
    startTimeMs,
    endTimeMs,
    distanceMeters: sample.distanceMeters,
  }
}

function makeNativeActiveEnergyBurnedSampleInput(
  sample: ActiveEnergyBurnedSampleInput,
  index: number
): NativeActiveEnergyBurnedSampleInput {
  const startTimeMs = assertValidSampleDate(sample.startDate, index, 'startDate')
  const endTimeMs = assertValidSampleDate(sample.endDate, index, 'endDate')

  assertSampleInterval(startTimeMs, endTimeMs, index)

  if (!Number.isFinite(sample.kilocalories) || sample.kilocalories < 0) {
    throw new Error(`samples[${index}]: kilocalories must be a non-negative number`)
  }

  if (sample.kilocalories > MAX_KILOCALORIES) {
    throw new Error(`samples[${index}]: kilocalories must not exceed ${MAX_KILOCALORIES}`)
  }

  return {
    startTimeMs,
    endTimeMs,
    kilocalories: sample.kilocalories,
  }
}

function makeNativeHeartRateSampleInput(
  sample: HeartRateSampleInput,
  index: number
): NativeHeartRateSampleInput {
  const timeMs = assertValidSampleDate(sample.date, index, 'date')

  if (!Number.isFinite(sample.bpm) || sample.bpm < MIN_BPM || sample.bpm > MAX_BPM) {
    throw new Error(`samples[${index}]: bpm must be between ${MIN_BPM} and ${MAX_BPM}`)
  }

  return {
    timeMs,
    bpm: sample.bpm,
  }
}

function makeNativeBodyMassSampleInput(
  sample: BodyMassSampleInput,
  index: number
): NativeBodyMassSampleInput {
  const timeMs = assertValidSampleDate(sample.date, index, 'date')

  if (!Number.isFinite(sample.kilograms) || sample.kilograms <= 0) {
    throw new Error(`samples[${index}]: kilograms must be greater than 0`)
  }

  if (sample.kilograms > MAX_KILOGRAMS) {
    throw new Error(`samples[${index}]: kilograms must not exceed ${MAX_KILOGRAMS}`)
  }

  return {
    timeMs,
    kilograms: sample.kilograms,
  }
}

function makeStepSample(sample: NativeStepSample): StepSample {
  return {
    startDate: new Date(sample.startTimeMs),
    endDate: new Date(sample.endTimeMs),
    count: sample.count,
  }
}

function makeDistanceSample(sample: NativeDistanceSample): DistanceSample {
  return {
    startDate: new Date(sample.startTimeMs),
    endDate: new Date(sample.endTimeMs),
    distanceMeters: sample.distanceMeters,
  }
}

function makeActiveEnergyBurnedSample(
  sample: NativeActiveEnergyBurnedSample
): ActiveEnergyBurnedSample {
  return {
    startDate: new Date(sample.startTimeMs),
    endDate: new Date(sample.endTimeMs),
    kilocalories: sample.kilocalories,
  }
}

function makeBodyMassSample(sample: NativeBodyMassSample): BodyMassSample {
  return {
    startDate: new Date(sample.startTimeMs),
    endDate: new Date(sample.endTimeMs),
    kilograms: sample.kilograms,
    source: sample.source,
  }
}

function makeHeartRateSample(sample: NativeHeartRateSample): HeartRateSample {
  return {
    date: new Date(sample.timeMs),
    bpm: sample.bpm,
    source: sample.source,
  }
}

function makeSleepSample(sample: NativeSleepSample): SleepSample {
  return {
    startDate: new Date(sample.startTimeMs),
    endDate: new Date(sample.endTimeMs),
    stage: sample.stage as SleepSample['stage'],
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
  | 'readDistance'
  | 'readDailyDistanceTotals'
  | 'readActiveEnergyBurned'
  | 'readDailyActiveEnergyBurnedTotals'
  | 'readBodyMass'
  | 'readHeartRate'
  | 'readHeartRateStatistics'
  | 'readSleepSamples'
  | 'saveSteps'
  | 'saveDistance'
  | 'saveActiveEnergyBurned'
  | 'saveHeartRate'
  | 'saveBodyMass'
  | 'requestAuthorization'
> & {
  getRequestStatusForAuthorization(
    permissions: HealthPermission[]
  ): ReturnType<NitroHealthSpec['getRequestStatusForAuthorization']>
  readSteps(query: HealthDateRangeQuery): Promise<StepSample[]>
  readDailyStepTotals(query: HealthDateRangeQuery): Promise<DailyStepTotal[]>
  readDistance(query: HealthDateRangeQuery): Promise<DistanceSample[]>
  readDailyDistanceTotals(query: HealthDateRangeQuery): Promise<DailyDistanceTotal[]>
  readActiveEnergyBurned(query: HealthDateRangeQuery): Promise<ActiveEnergyBurnedSample[]>
  readDailyActiveEnergyBurnedTotals(
    query: HealthDateRangeQuery
  ): Promise<DailyActiveEnergyBurnedTotal[]>
  readBodyMass(query: HealthDateRangeQuery): Promise<BodyMassSample[]>
  readHeartRate(query: HealthDateRangeQuery): Promise<HeartRateSample[]>
  readHeartRateStatistics(query: HealthTimeRangeQuery): Promise<HeartRateStatistics>
  readSleepSamples(query: HealthDateRangeQuery): Promise<SleepSample[]>
  saveSteps(samples: StepSampleInput[]): Promise<void>
  saveDistance(samples: DistanceSampleInput[]): Promise<void>
  saveActiveEnergyBurned(samples: ActiveEnergyBurnedSampleInput[]): Promise<void>
  saveHeartRate(samples: HeartRateSampleInput[]): Promise<void>
  saveBodyMass(samples: BodyMassSampleInput[]): Promise<void>
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
  async readDistance(query) {
    const samples = await NitroHealthNative.readDistance(makeNativeDateRangeQuery(query))

    return samples.map(makeDistanceSample)
  },
  async readDailyDistanceTotals(query) {
    const samples = await NitroHealthNative.readDailyDistanceTotals(makeNativeDateRangeQuery(query))

    return samples.map(makeDistanceSample)
  },
  async readActiveEnergyBurned(query) {
    const samples = await NitroHealthNative.readActiveEnergyBurned(makeNativeDateRangeQuery(query))

    return samples.map(makeActiveEnergyBurnedSample)
  },
  async readDailyActiveEnergyBurnedTotals(query) {
    const samples = await NitroHealthNative.readDailyActiveEnergyBurnedTotals(
      makeNativeDateRangeQuery(query)
    )

    return samples.map(makeActiveEnergyBurnedSample)
  },
  async readBodyMass(query) {
    const samples = await NitroHealthNative.readBodyMass(makeNativeDateRangeQuery(query))

    return samples.map(makeBodyMassSample)
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
  async readSleepSamples(query) {
    const samples = await NitroHealthNative.readSleepSamples(makeNativeDateRangeQuery(query))

    return samples.map(makeSleepSample)
  },
  async saveSteps(samples) {
    assertNonEmptySamples(samples)
    return NitroHealthNative.saveSteps(samples.map(makeNativeStepSampleInput))
  },
  async saveDistance(samples) {
    assertNonEmptySamples(samples)
    return NitroHealthNative.saveDistance(samples.map(makeNativeDistanceSampleInput))
  },
  async saveActiveEnergyBurned(samples) {
    assertNonEmptySamples(samples)
    return NitroHealthNative.saveActiveEnergyBurned(
      samples.map(makeNativeActiveEnergyBurnedSampleInput)
    )
  },
  async saveHeartRate(samples) {
    assertNonEmptySamples(samples)
    return NitroHealthNative.saveHeartRate(samples.map(makeNativeHeartRateSampleInput))
  },
  async saveBodyMass(samples) {
    assertNonEmptySamples(samples)
    return NitroHealthNative.saveBodyMass(samples.map(makeNativeBodyMassSampleInput))
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
