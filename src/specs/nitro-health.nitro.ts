import type { HybridObject } from 'react-native-nitro-modules'
import type { AuthorizationRequestStatus } from '../AuthorizationRequestStatus'
import type { HealthAvailabilityStatus } from '../HealthAvailabilityStatus'
import type { NativeActiveEnergyBurnedSampleInput } from '../NativeActiveEnergyBurnedSampleInput'
import type { NativeActiveEnergyBurnedSamplePage } from '../NativeActiveEnergyBurnedSamplePage'
import type { NativeBodyMassSampleInput } from '../NativeBodyMassSampleInput'
import type { NativeBodyMassSamplePage } from '../NativeBodyMassSamplePage'
import type { NativeDistanceSampleInput } from '../NativeDistanceSampleInput'
import type { NativeDistanceSamplePage } from '../NativeDistanceSamplePage'
import type { NativeHealthAuthorizationResult } from '../NativeHealthAuthorizationResult'
import type { NativeHealthChangesResult } from '../NativeHealthChangesResult'
import type { NativeHealthDateRangeQuery } from '../NativeHealthDateRangeQuery'
import type { NativeHealthStatistics } from '../NativeHealthStatistics'
import type { NativeHealthStatisticsQuery } from '../NativeHealthStatisticsQuery'
import type { NativeHealthTimeRangeQuery } from '../NativeHealthTimeRangeQuery'
import type { NativeHealthPermission } from '../NativeHealthPermission'
import type { NativeHeartRateSampleInput } from '../NativeHeartRateSampleInput'
import type { NativeHeartRateSamplePage } from '../NativeHeartRateSamplePage'
import type { NativeHeartRateStatistics } from '../NativeHeartRateStatistics'
import type { NativeHeartRateVariabilitySamplePage } from '../NativeHeartRateVariabilitySamplePage'
import type { NativeHeightSampleInput } from '../NativeHeightSampleInput'
import type { NativeHeightSamplePage } from '../NativeHeightSamplePage'
import type { NativeOxygenSaturationSampleInput } from '../NativeOxygenSaturationSampleInput'
import type { NativeOxygenSaturationSamplePage } from '../NativeOxygenSaturationSamplePage'
import type { NativeRestingHeartRateSampleInput } from '../NativeRestingHeartRateSampleInput'
import type { NativeRestingHeartRateSamplePage } from '../NativeRestingHeartRateSamplePage'
import type { NativeSleepSamplePage } from '../NativeSleepSamplePage'
import type { NativeStepSampleInput } from '../NativeStepSampleInput'
import type { NativeStepSamplePage } from '../NativeStepSamplePage'
import type { NativeWorkoutSamplePage } from '../NativeWorkoutSamplePage'

export interface NitroHealth extends HybridObject<{ ios: 'swift'; android: 'kotlin' }> {
  isAvailable(): boolean
  getAvailabilityStatus(): HealthAvailabilityStatus
  openHealthConnectInstall(): boolean
  openHealthSettings(): Promise<boolean>
  createChangesToken(dataType: string): Promise<string>
  getChanges(dataType: string, changesToken: string): Promise<NativeHealthChangesResult>
  readSteps(query: NativeHealthDateRangeQuery): Promise<NativeStepSamplePage>
  readDistance(query: NativeHealthDateRangeQuery): Promise<NativeDistanceSamplePage>
  readActiveEnergyBurned(
    query: NativeHealthDateRangeQuery
  ): Promise<NativeActiveEnergyBurnedSamplePage>
  readBodyMass(query: NativeHealthDateRangeQuery): Promise<NativeBodyMassSamplePage>
  readHeartRate(query: NativeHealthDateRangeQuery): Promise<NativeHeartRateSamplePage>
  readHeartRateStatistics(query: NativeHealthTimeRangeQuery): Promise<NativeHeartRateStatistics>
  readRestingHeartRate(query: NativeHealthDateRangeQuery): Promise<NativeRestingHeartRateSamplePage>
  readHeartRateVariability(
    query: NativeHealthDateRangeQuery
  ): Promise<NativeHeartRateVariabilitySamplePage>
  readOxygenSaturation(query: NativeHealthDateRangeQuery): Promise<NativeOxygenSaturationSamplePage>
  readHeight(query: NativeHealthDateRangeQuery): Promise<NativeHeightSamplePage>
  readStatistics(
    dataType: string,
    query: NativeHealthStatisticsQuery
  ): Promise<NativeHealthStatistics[]>
  readSleepSamples(query: NativeHealthDateRangeQuery): Promise<NativeSleepSamplePage>
  readWorkouts(query: NativeHealthDateRangeQuery): Promise<NativeWorkoutSamplePage>
  saveSteps(samples: NativeStepSampleInput[]): Promise<void>
  saveDistance(samples: NativeDistanceSampleInput[]): Promise<void>
  saveActiveEnergyBurned(samples: NativeActiveEnergyBurnedSampleInput[]): Promise<void>
  saveHeartRate(samples: NativeHeartRateSampleInput[]): Promise<void>
  saveBodyMass(samples: NativeBodyMassSampleInput[]): Promise<void>
  saveRestingHeartRate(samples: NativeRestingHeartRateSampleInput[]): Promise<void>
  saveOxygenSaturation(samples: NativeOxygenSaturationSampleInput[]): Promise<void>
  saveHeight(samples: NativeHeightSampleInput[]): Promise<void>
  deleteSamplesByUuids(dataType: string, uuids: string[]): Promise<void>
  deleteSamplesByTimeRange(dataType: string, query: NativeHealthTimeRangeQuery): Promise<void>
  getRequestStatusForAuthorization(
    permissions: NativeHealthPermission[]
  ): Promise<AuthorizationRequestStatus>
  requestAuthorization(
    permissions: NativeHealthPermission[]
  ): Promise<NativeHealthAuthorizationResult>
}
