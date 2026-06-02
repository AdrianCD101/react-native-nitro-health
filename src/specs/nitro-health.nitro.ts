import type { HybridObject } from 'react-native-nitro-modules'
import type { AuthorizationRequestStatus } from '../AuthorizationRequestStatus'
import type { HealthAvailabilityStatus } from '../HealthAvailabilityStatus'
import type { NativeActiveEnergyBurnedSample } from '../NativeActiveEnergyBurnedSample'
import type { NativeDistanceSample } from '../NativeDistanceSample'
import type { NativeHealthAuthorizationResult } from '../NativeHealthAuthorizationResult'
import type { NativeHealthDateRangeQuery } from '../NativeHealthDateRangeQuery'
import type { NativeHealthTimeRangeQuery } from '../NativeHealthTimeRangeQuery'
import type { NativeHealthPermission } from '../NativeHealthPermission'
import type { NativeHeartRateSample } from '../NativeHeartRateSample'
import type { NativeHeartRateStatistics } from '../NativeHeartRateStatistics'
import type { NativeStepSample } from '../NativeStepSample'

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
  readHeartRate(query: NativeHealthDateRangeQuery): Promise<NativeHeartRateSample[]>
  readHeartRateStatistics(query: NativeHealthTimeRangeQuery): Promise<NativeHeartRateStatistics>
  getRequestStatusForAuthorization(
    permissions: NativeHealthPermission[]
  ): Promise<AuthorizationRequestStatus>
  requestAuthorization(
    permissions: NativeHealthPermission[]
  ): Promise<NativeHealthAuthorizationResult>
}
