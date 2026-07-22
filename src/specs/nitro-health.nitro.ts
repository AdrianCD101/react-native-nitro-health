import type { HybridObject } from 'react-native-nitro-modules'
import type { AuthorizationRequestStatus } from '../AuthorizationRequestStatus'
import type { HealthAvailabilityStatus } from '../HealthAvailabilityStatus'
import type { NativeActiveEnergyBurnedSample } from '../NativeActiveEnergyBurnedSample'
import type { NativeActiveEnergyBurnedSampleInput } from '../NativeActiveEnergyBurnedSampleInput'
import type { NativeBodyMassSample } from '../NativeBodyMassSample'
import type { NativeBodyMassSampleInput } from '../NativeBodyMassSampleInput'
import type { NativeDistanceSample } from '../NativeDistanceSample'
import type { NativeDistanceSampleInput } from '../NativeDistanceSampleInput'
import type { NativeHealthAuthorizationResult } from '../NativeHealthAuthorizationResult'
import type { NativeHealthDateRangeQuery } from '../NativeHealthDateRangeQuery'
import type { NativeHealthStatistics } from '../NativeHealthStatistics'
import type { NativeHealthStatisticsQuery } from '../NativeHealthStatisticsQuery'
import type { NativeHealthTimeRangeQuery } from '../NativeHealthTimeRangeQuery'
import type { NativeHealthPermission } from '../NativeHealthPermission'
import type { NativeHeartRateSample } from '../NativeHeartRateSample'
import type { NativeHeartRateSampleInput } from '../NativeHeartRateSampleInput'
import type { NativeHeartRateStatistics } from '../NativeHeartRateStatistics'
import type { NativeHeartRateVariabilitySample } from '../NativeHeartRateVariabilitySample'
import type { NativeHeightSample } from '../NativeHeightSample'
import type { NativeHeightSampleInput } from '../NativeHeightSampleInput'
import type { NativeOxygenSaturationSample } from '../NativeOxygenSaturationSample'
import type { NativeOxygenSaturationSampleInput } from '../NativeOxygenSaturationSampleInput'
import type { NativeRestingHeartRateSample } from '../NativeRestingHeartRateSample'
import type { NativeRestingHeartRateSampleInput } from '../NativeRestingHeartRateSampleInput'
import type { NativeSleepSample } from '../NativeSleepSample'
import type { NativeStepSample } from '../NativeStepSample'
import type { NativeStepSampleInput } from '../NativeStepSampleInput'

export interface NitroHealth extends HybridObject<{ ios: 'swift'; android: 'kotlin' }> {
  isAvailable(): boolean
  getAvailabilityStatus(): HealthAvailabilityStatus
  openHealthConnectInstall(): boolean
  openHealthSettings(): Promise<boolean>
  readSteps(query: NativeHealthDateRangeQuery): Promise<NativeStepSample[]>
  readDailyStepTotals(query: NativeHealthDateRangeQuery): Promise<NativeStepSample[]>
  readDistance(query: NativeHealthDateRangeQuery): Promise<NativeDistanceSample[]>
  readDailyDistanceTotals(query: NativeHealthDateRangeQuery): Promise<NativeDistanceSample[]>
  readActiveEnergyBurned(
    query: NativeHealthDateRangeQuery
  ): Promise<NativeActiveEnergyBurnedSample[]>
  readDailyActiveEnergyBurnedTotals(
    query: NativeHealthDateRangeQuery
  ): Promise<NativeActiveEnergyBurnedSample[]>
  readBodyMass(query: NativeHealthDateRangeQuery): Promise<NativeBodyMassSample[]>
  readHeartRate(query: NativeHealthDateRangeQuery): Promise<NativeHeartRateSample[]>
  readHeartRateStatistics(query: NativeHealthTimeRangeQuery): Promise<NativeHeartRateStatistics>
  readRestingHeartRate(query: NativeHealthDateRangeQuery): Promise<NativeRestingHeartRateSample[]>
  readHeartRateVariability(
    query: NativeHealthDateRangeQuery
  ): Promise<NativeHeartRateVariabilitySample[]>
  readOxygenSaturation(query: NativeHealthDateRangeQuery): Promise<NativeOxygenSaturationSample[]>
  readHeight(query: NativeHealthDateRangeQuery): Promise<NativeHeightSample[]>
  readStatistics(
    dataType: string,
    query: NativeHealthStatisticsQuery
  ): Promise<NativeHealthStatistics[]>
  readSleepSamples(query: NativeHealthDateRangeQuery): Promise<NativeSleepSample[]>
  saveSteps(samples: NativeStepSampleInput[]): Promise<void>
  saveDistance(samples: NativeDistanceSampleInput[]): Promise<void>
  saveActiveEnergyBurned(samples: NativeActiveEnergyBurnedSampleInput[]): Promise<void>
  saveHeartRate(samples: NativeHeartRateSampleInput[]): Promise<void>
  saveBodyMass(samples: NativeBodyMassSampleInput[]): Promise<void>
  saveRestingHeartRate(samples: NativeRestingHeartRateSampleInput[]): Promise<void>
  saveOxygenSaturation(samples: NativeOxygenSaturationSampleInput[]): Promise<void>
  saveHeight(samples: NativeHeightSampleInput[]): Promise<void>
  getRequestStatusForAuthorization(
    permissions: NativeHealthPermission[]
  ): Promise<AuthorizationRequestStatus>
  requestAuthorization(
    permissions: NativeHealthPermission[]
  ): Promise<NativeHealthAuthorizationResult>
}
