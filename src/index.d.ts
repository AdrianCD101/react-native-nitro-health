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
import type { HealthDataType } from './HealthDataType'
import type { HealthDateRangeQuery } from './HealthDateRangeQuery'
import type { HealthPermission } from './HealthPermission'
import type { HealthStatistics } from './HealthStatistics'
import type { HealthStatisticsQuery } from './HealthStatisticsQuery'
import type { HealthTimeRangeQuery } from './HealthTimeRangeQuery'
import type { HeartRateSample } from './HeartRateSample'
import type { HeartRateSampleInput } from './HeartRateSampleInput'
import type { HeartRateStatistics } from './HeartRateStatistics'
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
export type { HealthStatistics } from './HealthStatistics'
export type { HealthStatisticsQuery } from './HealthStatisticsQuery'
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
export type { NativeHealthStatistics } from './NativeHealthStatistics'
export type { NativeHealthStatisticsQuery } from './NativeHealthStatisticsQuery'
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
export type { StatisticsBucket } from './StatisticsBucket'
export type { StatisticsMetric } from './StatisticsMetric'
export type { StepSample } from './StepSample'
export type { StepSampleInput } from './StepSampleInput'
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
  | 'readStatistics'
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
  /**
   * @deprecated Use readStatistics('steps', { ..., bucket: 'day', metrics: ['sum'] }) instead. Will be removed before 1.0.
   */
  readDailyStepTotals(query: HealthDateRangeQuery): Promise<DailyStepTotal[]>
  readDistance(query: HealthDateRangeQuery): Promise<DistanceSample[]>
  /**
   * @deprecated Use readStatistics('distance', { ..., bucket: 'day', metrics: ['sum'] }) instead. Will be removed before 1.0.
   */
  readDailyDistanceTotals(query: HealthDateRangeQuery): Promise<DailyDistanceTotal[]>
  readActiveEnergyBurned(query: HealthDateRangeQuery): Promise<ActiveEnergyBurnedSample[]>
  /**
   * @deprecated Use readStatistics('activeEnergyBurned', { ..., bucket: 'day', metrics: ['sum'] }) instead. Will be removed before 1.0.
   */
  readDailyActiveEnergyBurnedTotals(
    query: HealthDateRangeQuery
  ): Promise<DailyActiveEnergyBurnedTotal[]>
  readBodyMass(query: HealthDateRangeQuery): Promise<BodyMassSample[]>
  readHeartRate(query: HealthDateRangeQuery): Promise<HeartRateSample[]>
  readHeartRateStatistics(query: HealthTimeRangeQuery): Promise<HeartRateStatistics>
  readStatistics(
    dataType: HealthDataType,
    query: HealthStatisticsQuery
  ): Promise<HealthStatistics[]>
  readSleepSamples(query: HealthDateRangeQuery): Promise<SleepSample[]>
  saveSteps(samples: StepSampleInput[]): Promise<void>
  saveDistance(samples: DistanceSampleInput[]): Promise<void>
  saveActiveEnergyBurned(samples: ActiveEnergyBurnedSampleInput[]): Promise<void>
  saveHeartRate(samples: HeartRateSampleInput[]): Promise<void>
  saveBodyMass(samples: BodyMassSampleInput[]): Promise<void>
  requestAuthorization(permissions: HealthPermission[]): Promise<HealthAuthorizationResult>
}
export declare const NitroHealth: NitroHealth
