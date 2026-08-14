import type { HybridObject } from 'react-native-nitro-modules'
import type { BackgroundDeliveryFrequency } from '../BackgroundDeliveryFrequency'
import type { NativeActiveEnergyBurnedSampleInput } from '../NativeActiveEnergyBurnedSampleInput'
import type { NativeActiveEnergyBurnedSamplePage } from '../NativeActiveEnergyBurnedSamplePage'
import type { NativeFloorsClimbedSampleInput } from '../NativeFloorsClimbedSampleInput'
import type { NativeFloorsClimbedSamplePage } from '../NativeFloorsClimbedSamplePage'
import type { NativeBackgroundChangesResult } from '../NativeBackgroundChangesResult'
import type { NativeBasalBodyTemperatureSampleInput } from '../NativeBasalBodyTemperatureSampleInput'
import type { NativeBasalBodyTemperatureSamplePage } from '../NativeBasalBodyTemperatureSamplePage'
import type { NativeBloodGlucoseSampleInput } from '../NativeBloodGlucoseSampleInput'
import type { NativeBloodGlucoseSamplePage } from '../NativeBloodGlucoseSamplePage'
import type { NativeBloodPressureSampleInput } from '../NativeBloodPressureSampleInput'
import type { NativeBloodPressureSamplePage } from '../NativeBloodPressureSamplePage'
import type { NativeBodyFatSampleInput } from '../NativeBodyFatSampleInput'
import type { NativeBodyFatSamplePage } from '../NativeBodyFatSamplePage'
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
import type { NativeHealthWriteResult } from '../NativeHealthWriteResult'
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
import type { NativeVo2MaxSampleInput } from '../NativeVo2MaxSampleInput'
import type { NativeLeanBodyMassSampleInput } from '../NativeLeanBodyMassSampleInput'
import type { NativeLeanBodyMassSamplePage } from '../NativeLeanBodyMassSamplePage'
import type { NativeHeightSamplePage } from '../NativeHeightSamplePage'
import type { NativeHydrationSampleInput } from '../NativeHydrationSampleInput'
import type { NativeHydrationSamplePage } from '../NativeHydrationSamplePage'
import type { NativeVo2MaxSamplePage } from '../NativeVo2MaxSamplePage'
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
  readHydration(query: NativeHealthDateRangeQuery): Promise<NativeHydrationSamplePage>
  readFloorsClimbed(query: NativeHealthDateRangeQuery): Promise<NativeFloorsClimbedSamplePage>
  readBodyMass(query: NativeHealthDateRangeQuery): Promise<NativeBodyMassSamplePage>
  readHeartRate(query: NativeHealthDateRangeQuery): Promise<NativeHeartRateSamplePage>
  readBloodPressure(query: NativeHealthDateRangeQuery): Promise<NativeBloodPressureSamplePage>
  readBloodGlucose(query: NativeHealthDateRangeQuery): Promise<NativeBloodGlucoseSamplePage>
  readBodyTemperature(query: NativeHealthDateRangeQuery): Promise<NativeBodyTemperatureSamplePage>
  readRespiratoryRate(query: NativeHealthDateRangeQuery): Promise<NativeRespiratoryRateSamplePage>
  readBodyFat(query: NativeHealthDateRangeQuery): Promise<NativeBodyFatSamplePage>
  readLeanBodyMass(query: NativeHealthDateRangeQuery): Promise<NativeLeanBodyMassSamplePage>
  readBasalBodyTemperature(
    query: NativeHealthDateRangeQuery
  ): Promise<NativeBasalBodyTemperatureSamplePage>
  readHeartRateStatistics(query: NativeHealthTimeRangeQuery): Promise<NativeHeartRateStatistics>
  readRestingHeartRate(query: NativeHealthDateRangeQuery): Promise<NativeRestingHeartRateSamplePage>
  readHeartRateVariability(
    query: NativeHealthDateRangeQuery
  ): Promise<NativeHeartRateVariabilitySamplePage>
  readOxygenSaturation(query: NativeHealthDateRangeQuery): Promise<NativeOxygenSaturationSamplePage>
  readHeight(query: NativeHealthDateRangeQuery): Promise<NativeHeightSamplePage>
  readVo2Max(query: NativeHealthDateRangeQuery): Promise<NativeVo2MaxSamplePage>
  readStatistics(
    dataType: string,
    query: NativeHealthStatisticsQuery
  ): Promise<NativeHealthStatistics[]>
  readSleepSamples(query: NativeHealthDateRangeQuery): Promise<NativeSleepSamplePage>
  readWorkouts(query: NativeHealthDateRangeQuery): Promise<NativeWorkoutSamplePage>
  saveSteps(samples: NativeStepSampleInput[]): Promise<NativeHealthWriteResult>
  saveDistance(samples: NativeDistanceSampleInput[]): Promise<NativeDistanceWriteResult>
  saveActiveEnergyBurned(
    samples: NativeActiveEnergyBurnedSampleInput[]
  ): Promise<NativeHealthWriteResult>
  saveHydration(samples: NativeHydrationSampleInput[]): Promise<NativeHealthWriteResult>
  saveFloorsClimbed(samples: NativeFloorsClimbedSampleInput[]): Promise<NativeHealthWriteResult>
  saveHeartRate(samples: NativeHeartRateSampleInput[]): Promise<NativeHealthWriteResult>
  saveBloodPressure(samples: NativeBloodPressureSampleInput[]): Promise<NativeHealthWriteResult>
  saveBloodGlucose(samples: NativeBloodGlucoseSampleInput[]): Promise<NativeHealthWriteResult>
  saveBodyTemperature(samples: NativeBodyTemperatureSampleInput[]): Promise<NativeHealthWriteResult>
  saveRespiratoryRate(samples: NativeRespiratoryRateSampleInput[]): Promise<NativeHealthWriteResult>
  saveBodyFat(samples: NativeBodyFatSampleInput[]): Promise<NativeHealthWriteResult>
  saveLeanBodyMass(samples: NativeLeanBodyMassSampleInput[]): Promise<NativeHealthWriteResult>
  saveBasalBodyTemperature(
    samples: NativeBasalBodyTemperatureSampleInput[]
  ): Promise<NativeHealthWriteResult>
  saveBodyMass(samples: NativeBodyMassSampleInput[]): Promise<NativeHealthWriteResult>
  saveRestingHeartRate(
    samples: NativeRestingHeartRateSampleInput[]
  ): Promise<NativeHealthWriteResult>
  saveOxygenSaturation(
    samples: NativeOxygenSaturationSampleInput[]
  ): Promise<NativeHealthWriteResult>
  saveHeight(samples: NativeHeightSampleInput[]): Promise<NativeHealthWriteResult>
  saveVo2Max(samples: NativeVo2MaxSampleInput[]): Promise<NativeHealthWriteResult>
  saveSleepSessions(sessions: NativeSleepSessionInput[]): Promise<NativeHealthWriteResult>
  saveWorkout(workout: NativeWorkoutSampleInput): Promise<NativeHealthWriteResult>
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
