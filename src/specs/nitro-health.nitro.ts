import type { HybridObject } from 'react-native-nitro-modules'
import type { BackgroundDeliveryFrequency } from '../BackgroundDeliveryFrequency'
import type { NativeActiveEnergyBurnedSampleInput } from '../NativeActiveEnergyBurnedSampleInput'
import type { NativeActiveEnergyBurnedSamplePage } from '../NativeActiveEnergyBurnedSamplePage'
import type { NativeBackgroundChangesResult } from '../NativeBackgroundChangesResult'
import type { NativeBloodGlucoseSampleInput } from '../NativeBloodGlucoseSampleInput'
import type { NativeBloodGlucoseSamplePage } from '../NativeBloodGlucoseSamplePage'
import type { NativeBloodPressureSampleInput } from '../NativeBloodPressureSampleInput'
import type { NativeBloodPressureSamplePage } from '../NativeBloodPressureSamplePage'
import type { NativeBodyMassSampleInput } from '../NativeBodyMassSampleInput'
import type { NativeBodyMassSamplePage } from '../NativeBodyMassSamplePage'
import type { NativeBodyTemperatureSampleInput } from '../NativeBodyTemperatureSampleInput'
import type { NativeBodyTemperatureSamplePage } from '../NativeBodyTemperatureSamplePage'
import type { NativeDistanceSampleInput } from '../NativeDistanceSampleInput'
import type { NativeDistanceSamplePage } from '../NativeDistanceSamplePage'
import type { NativeDistanceWriteResult } from '../NativeDistanceWriteResult'
import type { NativeHealthAuthorizationResult } from '../NativeHealthAuthorizationResult'
import type {
  NativeHealthAvailability,
  NativeHealthAvailabilityRecoveryResult,
} from '../NativeHealthAvailability'
import type {
  NativeHealthAdditionalAccessStatus,
  NativeBackgroundChangesMode,
  NativeHealthCapabilities,
} from '../NativeHealthCapabilities'
import type { NativeHealthChangesResult } from '../NativeHealthChangesResult'
import type { NativeHealthDateRangeQuery } from '../NativeHealthDateRangeQuery'
import type { NativeHealthDeleteResult } from '../NativeHealthDeleteResult'
import type { NativeHealthStatistics } from '../NativeHealthStatistics'
import type { NativeHealthStatisticsQuery } from '../NativeHealthStatisticsQuery'
import type { NativeHealthTimeRangeQuery } from '../NativeHealthTimeRangeQuery'
import type { NativeHealthPermission } from '../NativeHealthPermission'
import type { NativeHealthPermissionStatusResult } from '../NativeHealthPermissionStatusResult'
import type { NativeHeartRateSampleInput } from '../NativeHeartRateSampleInput'
import type { NativeHeartRateSamplePage } from '../NativeHeartRateSamplePage'
import type { NativeHeartRateStatistics } from '../NativeHeartRateStatistics'
import type { NativeHeartRateVariabilitySamplePage } from '../NativeHeartRateVariabilitySamplePage'
import type { NativeHeightSampleInput } from '../NativeHeightSampleInput'
import type { NativeHeightSamplePage } from '../NativeHeightSamplePage'
import type { NativeOxygenSaturationSampleInput } from '../NativeOxygenSaturationSampleInput'
import type { NativeOxygenSaturationSamplePage } from '../NativeOxygenSaturationSamplePage'
import type { NativeRespiratoryRateSampleInput } from '../NativeRespiratoryRateSampleInput'
import type { NativeRespiratoryRateSamplePage } from '../NativeRespiratoryRateSamplePage'
import type { NativeRestingHeartRateSampleInput } from '../NativeRestingHeartRateSampleInput'
import type { NativeRestingHeartRateSamplePage } from '../NativeRestingHeartRateSamplePage'
import type { NativeSleepSessionInput } from '../NativeSleepSessionInput'
import type { NativeSleepSamplePage } from '../NativeSleepSamplePage'
import type { NativeStepSampleInput } from '../NativeStepSampleInput'
import type { NativeStepSamplePage } from '../NativeStepSamplePage'
import type { NativeWorkoutSamplePage } from '../NativeWorkoutSamplePage'
import type { NativeWorkoutSampleInput } from '../NativeWorkoutSampleInput'
import type { NativePermissionWorkflowResult } from '../NativePermissionWorkflowResult'

export interface NitroHealth extends HybridObject<{ ios: 'swift'; android: 'kotlin' }> {
  getAvailability(): NativeHealthAvailability
  performAvailabilityRecovery(): Promise<NativeHealthAvailabilityRecoveryResult>
  getCapabilities(): Promise<NativeHealthCapabilities>
  requestAdditionalAccess(access: string): Promise<NativeHealthAdditionalAccessStatus>
  managePermissions(): Promise<NativePermissionWorkflowResult>
  revokeAllPermissions(): Promise<NativePermissionWorkflowResult>
  getBackgroundChangesMode(): NativeBackgroundChangesMode
  configureBackgroundChanges(
    dataTypes: string[],
    frequency: BackgroundDeliveryFrequency
  ): Promise<NativeBackgroundChangesResult>
  disableBackgroundChanges(dataTypes?: string[]): Promise<NativeBackgroundChangesResult>
  setOnBackgroundChangeListener(
    listener: ((dataTypes: string[], deliveryId: string) => void) | undefined
  ): boolean
  acknowledgeBackgroundChange(deliveryId: string): boolean
  createChangesToken(dataType: string): Promise<string>
  getChanges(dataType: string, changesToken: string): Promise<NativeHealthChangesResult>
  readSteps(query: NativeHealthDateRangeQuery): Promise<NativeStepSamplePage>
  readDistance(query: NativeHealthDateRangeQuery): Promise<NativeDistanceSamplePage>
  readActiveEnergyBurned(
    query: NativeHealthDateRangeQuery
  ): Promise<NativeActiveEnergyBurnedSamplePage>
  readBodyMass(query: NativeHealthDateRangeQuery): Promise<NativeBodyMassSamplePage>
  readHeartRate(query: NativeHealthDateRangeQuery): Promise<NativeHeartRateSamplePage>
  readBloodPressure(query: NativeHealthDateRangeQuery): Promise<NativeBloodPressureSamplePage>
  readBloodGlucose(query: NativeHealthDateRangeQuery): Promise<NativeBloodGlucoseSamplePage>
  readBodyTemperature(query: NativeHealthDateRangeQuery): Promise<NativeBodyTemperatureSamplePage>
  readRespiratoryRate(query: NativeHealthDateRangeQuery): Promise<NativeRespiratoryRateSamplePage>
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
  saveDistance(samples: NativeDistanceSampleInput[]): Promise<NativeDistanceWriteResult>
  saveActiveEnergyBurned(samples: NativeActiveEnergyBurnedSampleInput[]): Promise<void>
  saveHeartRate(samples: NativeHeartRateSampleInput[]): Promise<void>
  saveBloodPressure(samples: NativeBloodPressureSampleInput[]): Promise<void>
  saveBloodGlucose(samples: NativeBloodGlucoseSampleInput[]): Promise<void>
  saveBodyTemperature(samples: NativeBodyTemperatureSampleInput[]): Promise<void>
  saveRespiratoryRate(samples: NativeRespiratoryRateSampleInput[]): Promise<void>
  saveBodyMass(samples: NativeBodyMassSampleInput[]): Promise<void>
  saveRestingHeartRate(samples: NativeRestingHeartRateSampleInput[]): Promise<void>
  saveOxygenSaturation(samples: NativeOxygenSaturationSampleInput[]): Promise<void>
  saveHeight(samples: NativeHeightSampleInput[]): Promise<void>
  saveSleepSessions(sessions: NativeSleepSessionInput[]): Promise<void>
  saveWorkout(workout: NativeWorkoutSampleInput): Promise<void>
  deleteRecordsByIds(dataType: string, recordIds: string[]): Promise<NativeHealthDeleteResult>
  deleteRecordsByTimeRange(
    dataType: string,
    query: NativeHealthTimeRangeQuery
  ): Promise<NativeHealthDeleteResult>
  getPermissionStatuses(
    permissions: NativeHealthPermission[]
  ): Promise<NativeHealthPermissionStatusResult>
  requestAuthorization(
    permissions: NativeHealthPermission[]
  ): Promise<NativeHealthAuthorizationResult>
}
