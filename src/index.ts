import { NitroModules } from 'react-native-nitro-modules'
import type { NitroHealth as NitroHealthSpec } from './specs/nitro-health.nitro'
import type { ActiveEnergyBurnedSample } from './ActiveEnergyBurnedSample'
import type { ActiveEnergyBurnedSampleInput } from './ActiveEnergyBurnedSampleInput'
import type { BodyMassSample } from './BodyMassSample'
import type { BodyMassSampleInput } from './BodyMassSampleInput'
import type { DistanceSample } from './DistanceSample'
import type { DistanceSampleInput } from './DistanceSampleInput'
import type { HealthAuthorizationResult } from './HealthAuthorizationResult'
import type { HealthDataType } from './HealthDataType'
import type { HealthDateRangeQuery } from './HealthDateRangeQuery'
import type { HealthPermission } from './HealthPermission'
import type { HealthSamplePage } from './HealthSamplePage'
import type { HealthStatistics } from './HealthStatistics'
import type { HealthStatisticsQuery } from './HealthStatisticsQuery'
import type { HealthTimeRangeQuery } from './HealthTimeRangeQuery'
import type { HeartRateSample } from './HeartRateSample'
import type { HeartRateSampleInput } from './HeartRateSampleInput'
import type { HeartRateStatistics } from './HeartRateStatistics'
import type { HeartRateVariabilitySample } from './HeartRateVariabilitySample'
import type { HeightSample } from './HeightSample'
import type { HeightSampleInput } from './HeightSampleInput'
import type { OxygenSaturationSample } from './OxygenSaturationSample'
import type { OxygenSaturationSampleInput } from './OxygenSaturationSampleInput'
import type { RestingHeartRateSample } from './RestingHeartRateSample'
import type { RestingHeartRateSampleInput } from './RestingHeartRateSampleInput'
import type { SleepSample } from './SleepSample'
import type { StepSample } from './StepSample'
import type { StepSampleInput } from './StepSampleInput'
import type { WorkoutSample } from './WorkoutSample'
import {
  makeNativeSampleQuery,
  makeNativeStatisticsQuery,
  makeNativeTimeRangeQuery,
} from './internal/queryMapping'
import {
  makeActiveEnergyBurnedSample,
  makeBodyMassSample,
  makeDistanceSample,
  makeHealthStatistics,
  makeHeartRateSample,
  makeHeartRateStatistics,
  makeHeartRateVariabilitySample,
  makeHeightSample,
  makeNativeActiveEnergyBurnedSampleInput,
  makeNativeBodyMassSampleInput,
  makeNativeDistanceSampleInput,
  makeNativeHeartRateSampleInput,
  makeNativeHeightSampleInput,
  makeNativeOxygenSaturationSampleInput,
  makeNativeRestingHeartRateSampleInput,
  makeNativeStepSampleInput,
  makeOxygenSaturationSample,
  makeRestingHeartRateSample,
  makeSamplePage,
  makeSleepSample,
  makeStepSample,
  makeWorkoutSample,
} from './internal/sampleMapping'
import {
  assertDeletableUuids,
  assertNonEmptySamples,
  assertPermissions,
} from './internal/validation'

export type { ActiveEnergyBurnedSample } from './ActiveEnergyBurnedSample'
export type { ActiveEnergyBurnedSampleInput } from './ActiveEnergyBurnedSampleInput'
export type { AuthorizationRequestStatus } from './AuthorizationRequestStatus'
export type { BodyMassSample } from './BodyMassSample'
export type { BodyMassSampleInput } from './BodyMassSampleInput'
export type { DistanceSample } from './DistanceSample'
export type { DistanceSampleInput } from './DistanceSampleInput'
export type { HealthAuthorizationResult } from './HealthAuthorizationResult'
export type { HealthAuthorizationStatus } from './HealthAuthorizationStatus'
export type { HealthAvailabilityStatus } from './HealthAvailabilityStatus'
export type { HealthDataType } from './HealthDataType'
export type { HealthDateRangeQuery } from './HealthDateRangeQuery'
export type { HealthPermission } from './HealthPermission'
export type { HealthPermissionAccessType } from './HealthPermissionAccessType'
export type { HealthSamplePage } from './HealthSamplePage'
export type { HealthStatistics } from './HealthStatistics'
export type { HealthStatisticsQuery } from './HealthStatisticsQuery'
export type { HealthTimeRangeQuery } from './HealthTimeRangeQuery'
export type { HeartRateSample } from './HeartRateSample'
export type { HeartRateSampleInput } from './HeartRateSampleInput'
export type { HeartRateStatistics } from './HeartRateStatistics'
export type { HeartRateVariabilityMethod } from './HeartRateVariabilityMethod'
export type { HeartRateVariabilitySample } from './HeartRateVariabilitySample'
export type { HeightSample } from './HeightSample'
export type { HeightSampleInput } from './HeightSampleInput'
export type { NativeActiveEnergyBurnedSample } from './NativeActiveEnergyBurnedSample'
export type { NativeActiveEnergyBurnedSampleInput } from './NativeActiveEnergyBurnedSampleInput'
export type { NativeActiveEnergyBurnedSamplePage } from './NativeActiveEnergyBurnedSamplePage'
export type { NativeBodyMassSample } from './NativeBodyMassSample'
export type { NativeBodyMassSampleInput } from './NativeBodyMassSampleInput'
export type { NativeBodyMassSamplePage } from './NativeBodyMassSamplePage'
export type { NativeDistanceSample } from './NativeDistanceSample'
export type { NativeDistanceSampleInput } from './NativeDistanceSampleInput'
export type { NativeDistanceSamplePage } from './NativeDistanceSamplePage'
export type { NativeHealthAuthorizationResult } from './NativeHealthAuthorizationResult'
export type { NativeHealthDateRangeQuery } from './NativeHealthDateRangeQuery'
export type { NativeHealthStatistics } from './NativeHealthStatistics'
export type { NativeHealthStatisticsQuery } from './NativeHealthStatisticsQuery'
export type { NativeHealthTimeRangeQuery } from './NativeHealthTimeRangeQuery'
export type { NativeHealthPermission } from './NativeHealthPermission'
export type { NativeHeartRateSample } from './NativeHeartRateSample'
export type { NativeHeartRateSampleInput } from './NativeHeartRateSampleInput'
export type { NativeHeartRateSamplePage } from './NativeHeartRateSamplePage'
export type { NativeHeartRateStatistics } from './NativeHeartRateStatistics'
export type { NativeHeartRateVariabilitySample } from './NativeHeartRateVariabilitySample'
export type { NativeHeartRateVariabilitySamplePage } from './NativeHeartRateVariabilitySamplePage'
export type { NativeHeightSample } from './NativeHeightSample'
export type { NativeHeightSampleInput } from './NativeHeightSampleInput'
export type { NativeHeightSamplePage } from './NativeHeightSamplePage'
export type { NativeOxygenSaturationSample } from './NativeOxygenSaturationSample'
export type { NativeOxygenSaturationSampleInput } from './NativeOxygenSaturationSampleInput'
export type { NativeOxygenSaturationSamplePage } from './NativeOxygenSaturationSamplePage'
export type { NativeRestingHeartRateSample } from './NativeRestingHeartRateSample'
export type { NativeRestingHeartRateSampleInput } from './NativeRestingHeartRateSampleInput'
export type { NativeRestingHeartRateSamplePage } from './NativeRestingHeartRateSamplePage'
export type { NativeSleepSample } from './NativeSleepSample'
export type { NativeSleepSamplePage } from './NativeSleepSamplePage'
export type { NativeStepSample } from './NativeStepSample'
export type { NativeStepSampleInput } from './NativeStepSampleInput'
export type { NativeStepSamplePage } from './NativeStepSamplePage'
export type { NativeWorkoutSample } from './NativeWorkoutSample'
export type { NativeWorkoutSamplePage } from './NativeWorkoutSamplePage'
export type { NitroHealth as NitroHealthSpec } from './specs/nitro-health.nitro'
export type { OxygenSaturationSample } from './OxygenSaturationSample'
export type { OxygenSaturationSampleInput } from './OxygenSaturationSampleInput'
export type { RestingHeartRateSample } from './RestingHeartRateSample'
export type { RestingHeartRateSampleInput } from './RestingHeartRateSampleInput'
export type { SleepSample } from './SleepSample'
export type { SleepStage } from './SleepStage'
export type { StatisticsBucket } from './StatisticsBucket'
export type { StatisticsMetric } from './StatisticsMetric'
export type { StepSample } from './StepSample'
export type { StepSampleInput } from './StepSampleInput'
export type { WorkoutActivityType } from './WorkoutActivityType'
export type { WorkoutSample } from './WorkoutSample'

const NitroHealthNative = NitroModules.createHybridObject<NitroHealthSpec>('NitroHealth')

export type NitroHealth = Omit<
  NitroHealthSpec,
  | 'getRequestStatusForAuthorization'
  | 'readSteps'
  | 'readDistance'
  | 'readActiveEnergyBurned'
  | 'readBodyMass'
  | 'readHeartRate'
  | 'readHeartRateStatistics'
  | 'readRestingHeartRate'
  | 'readHeartRateVariability'
  | 'readOxygenSaturation'
  | 'readHeight'
  | 'readStatistics'
  | 'readSleepSamples'
  | 'readWorkouts'
  | 'saveSteps'
  | 'saveDistance'
  | 'saveActiveEnergyBurned'
  | 'saveHeartRate'
  | 'saveBodyMass'
  | 'saveRestingHeartRate'
  | 'saveOxygenSaturation'
  | 'saveHeight'
  | 'deleteSamplesByUuids'
  | 'deleteSamplesByTimeRange'
  | 'requestAuthorization'
> & {
  getRequestStatusForAuthorization(
    permissions: HealthPermission[]
  ): ReturnType<NitroHealthSpec['getRequestStatusForAuthorization']>
  readSteps(query: HealthDateRangeQuery): Promise<HealthSamplePage<StepSample>>
  readDistance(query: HealthDateRangeQuery): Promise<HealthSamplePage<DistanceSample>>
  readActiveEnergyBurned(
    query: HealthDateRangeQuery
  ): Promise<HealthSamplePage<ActiveEnergyBurnedSample>>
  readBodyMass(query: HealthDateRangeQuery): Promise<HealthSamplePage<BodyMassSample>>
  readHeartRate(query: HealthDateRangeQuery): Promise<HealthSamplePage<HeartRateSample>>
  readHeartRateStatistics(query: HealthTimeRangeQuery): Promise<HeartRateStatistics>
  readRestingHeartRate(
    query: HealthDateRangeQuery
  ): Promise<HealthSamplePage<RestingHeartRateSample>>
  readHeartRateVariability(
    query: HealthDateRangeQuery
  ): Promise<HealthSamplePage<HeartRateVariabilitySample>>
  readOxygenSaturation(
    query: HealthDateRangeQuery
  ): Promise<HealthSamplePage<OxygenSaturationSample>>
  readHeight(query: HealthDateRangeQuery): Promise<HealthSamplePage<HeightSample>>
  readStatistics(
    dataType: HealthDataType,
    query: HealthStatisticsQuery
  ): Promise<HealthStatistics[]>
  readSleepSamples(query: HealthDateRangeQuery): Promise<HealthSamplePage<SleepSample>>
  readWorkouts(query: HealthDateRangeQuery): Promise<HealthSamplePage<WorkoutSample>>
  saveSteps(samples: StepSampleInput[]): Promise<void>
  saveDistance(samples: DistanceSampleInput[]): Promise<void>
  saveActiveEnergyBurned(samples: ActiveEnergyBurnedSampleInput[]): Promise<void>
  saveHeartRate(samples: HeartRateSampleInput[]): Promise<void>
  saveBodyMass(samples: BodyMassSampleInput[]): Promise<void>
  saveRestingHeartRate(samples: RestingHeartRateSampleInput[]): Promise<void>
  saveOxygenSaturation(samples: OxygenSaturationSampleInput[]): Promise<void>
  saveHeight(samples: HeightSampleInput[]): Promise<void>
  deleteSamplesByUuids(dataType: HealthDataType, uuids: string[]): Promise<void>
  deleteSamplesByTimeRange(dataType: HealthDataType, query: HealthTimeRangeQuery): Promise<void>
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
    const page = await NitroHealthNative.readSteps(makeNativeSampleQuery(query))

    return makeSamplePage(page, makeStepSample)
  },
  async readDistance(query) {
    const page = await NitroHealthNative.readDistance(makeNativeSampleQuery(query))

    return makeSamplePage(page, makeDistanceSample)
  },
  async readActiveEnergyBurned(query) {
    const page = await NitroHealthNative.readActiveEnergyBurned(makeNativeSampleQuery(query))

    return makeSamplePage(page, makeActiveEnergyBurnedSample)
  },
  async readBodyMass(query) {
    const page = await NitroHealthNative.readBodyMass(makeNativeSampleQuery(query))

    return makeSamplePage(page, makeBodyMassSample)
  },
  async readHeartRate(query) {
    const page = await NitroHealthNative.readHeartRate(makeNativeSampleQuery(query))

    return makeSamplePage(page, makeHeartRateSample)
  },
  async readHeartRateStatistics(query) {
    const statistics = await NitroHealthNative.readHeartRateStatistics(
      makeNativeTimeRangeQuery(query)
    )

    return makeHeartRateStatistics(statistics)
  },
  async readRestingHeartRate(query) {
    const page = await NitroHealthNative.readRestingHeartRate(makeNativeSampleQuery(query))

    return makeSamplePage(page, makeRestingHeartRateSample)
  },
  async readHeartRateVariability(query) {
    const page = await NitroHealthNative.readHeartRateVariability(makeNativeSampleQuery(query))

    return makeSamplePage(page, makeHeartRateVariabilitySample)
  },
  async readOxygenSaturation(query) {
    const page = await NitroHealthNative.readOxygenSaturation(makeNativeSampleQuery(query))

    return makeSamplePage(page, makeOxygenSaturationSample)
  },
  async readHeight(query) {
    const page = await NitroHealthNative.readHeight(makeNativeSampleQuery(query))

    return makeSamplePage(page, makeHeightSample)
  },
  async readStatistics(dataType, query) {
    const statistics = await NitroHealthNative.readStatistics(
      dataType,
      makeNativeStatisticsQuery(dataType, query)
    )

    return statistics.map(makeHealthStatistics)
  },
  async readSleepSamples(query) {
    const page = await NitroHealthNative.readSleepSamples(makeNativeSampleQuery(query))

    return makeSamplePage(page, makeSleepSample)
  },
  async readWorkouts(query) {
    const page = await NitroHealthNative.readWorkouts(makeNativeSampleQuery(query))

    return makeSamplePage(page, makeWorkoutSample)
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
  async saveRestingHeartRate(samples) {
    assertNonEmptySamples(samples)
    return NitroHealthNative.saveRestingHeartRate(
      samples.map(makeNativeRestingHeartRateSampleInput)
    )
  },
  async saveOxygenSaturation(samples) {
    assertNonEmptySamples(samples)
    return NitroHealthNative.saveOxygenSaturation(
      samples.map(makeNativeOxygenSaturationSampleInput)
    )
  },
  async saveHeight(samples) {
    assertNonEmptySamples(samples)
    return NitroHealthNative.saveHeight(samples.map(makeNativeHeightSampleInput))
  },
  async deleteSamplesByUuids(dataType, uuids) {
    assertDeletableUuids(uuids)
    return NitroHealthNative.deleteSamplesByUuids(dataType, uuids)
  },
  async deleteSamplesByTimeRange(dataType, query) {
    return NitroHealthNative.deleteSamplesByTimeRange(dataType, makeNativeTimeRangeQuery(query))
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
