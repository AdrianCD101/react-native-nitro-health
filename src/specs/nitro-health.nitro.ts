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
import type { NativeHealthTimeRangeQuery } from '../NativeHealthTimeRangeQuery'
import type { NativeHealthPermission } from '../NativeHealthPermission'
import type { NativeHeartRateSample } from '../NativeHeartRateSample'
import type { NativeHeartRateSampleInput } from '../NativeHeartRateSampleInput'
import type { NativeHeartRateStatistics } from '../NativeHeartRateStatistics'
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
  readSleepSamples(query: NativeHealthDateRangeQuery): Promise<NativeSleepSample[]>
  saveSteps(samples: NativeStepSampleInput[]): Promise<void>
  saveDistance(samples: NativeDistanceSampleInput[]): Promise<void>
  saveActiveEnergyBurned(samples: NativeActiveEnergyBurnedSampleInput[]): Promise<void>
  saveHeartRate(samples: NativeHeartRateSampleInput[]): Promise<void>
  saveBodyMass(samples: NativeBodyMassSampleInput[]): Promise<void>
  getRequestStatusForAuthorization(
    permissions: NativeHealthPermission[]
  ): Promise<AuthorizationRequestStatus>
  requestAuthorization(
    permissions: NativeHealthPermission[]
  ): Promise<NativeHealthAuthorizationResult>
}
