import { NitroModules } from 'react-native-nitro-modules'
import type { ActiveEnergyBurnedSample } from './ActiveEnergyBurnedSample'
import type { ActiveEnergyBurnedSampleInput } from './ActiveEnergyBurnedSampleInput'
import type {
  BackgroundChangesConfiguration,
  BackgroundChangesConfigurationResult,
  BackgroundChangesSubscriptionResult,
} from './BackgroundChangesResult'
import type { BloodGlucoseSample } from './BloodGlucoseSample'
import type { BloodGlucoseSampleInput } from './BloodGlucoseSampleInput'
import type { BloodPressureSample } from './BloodPressureSample'
import type { BloodPressureSampleInput } from './BloodPressureSampleInput'
import type { BasalBodyTemperatureSample } from './BasalBodyTemperatureSample'
import type { BasalBodyTemperatureSampleInput } from './BasalBodyTemperatureSampleInput'
import type { BodyFatSample } from './BodyFatSample'
import type { BodyFatSampleInput } from './BodyFatSampleInput'
import type { BodyTemperatureSample } from './BodyTemperatureSample'
import type { BodyTemperatureSampleInput } from './BodyTemperatureSampleInput'
import type { BodyMassSample } from './BodyMassSample'
import type { BodyMassSampleInput } from './BodyMassSampleInput'
import type { DistanceSample } from './DistanceSample'
import type { DistanceSampleInput } from './DistanceSampleInput'
import type { DistanceWriteResult } from './DistanceScope'
import type {
  HealthAvailability,
  HealthAvailabilityRecovery,
  HealthAvailabilityRecoveryResult,
} from './HealthAvailability'
import type {
  HealthAdditionalAccess,
  HealthCapabilitiesResult,
  RequestHealthAdditionalAccessResult,
} from './HealthCapabilities'
import type { HealthAuthorizationResult } from './HealthAuthorizationResult'
import type { HealthChangeNotification } from './HealthChangeNotification'
import type { HealthChangesResult } from './HealthChangesResult'
import type { HealthDataType } from './HealthDataType'
import type { HealthDateRangeQuery } from './HealthDateRangeQuery'
import type { HealthIdentityDeleteResult, HealthTimeRangeDeleteResult } from './HealthDeleteResult'
import type { HealthPermission } from './HealthPermission'
import type {
  HealthPermissionManagementResult,
  HealthPermissionRevocationResult,
} from './HealthPermissionManagementResult'
import type { HealthPermissionStatusResult } from './HealthPermissionStatusResult'
import type { HealthSamplePage } from './HealthSamplePage'
import type { HealthRecordIdentity } from './HealthSampleIdentity'
import type { HealthStatisticsByDataType } from './HealthStatisticsByDataType'
import type { HealthStatisticsQuery } from './HealthStatisticsQuery'
import type { HealthTimeRangeQuery } from './HealthTimeRangeQuery'
import type { HeartRateSample } from './HeartRateSample'
import type { HeartRateSampleInput } from './HeartRateSampleInput'
import type { HeartRateStatistics } from './HeartRateStatistics'
import type { HeartRateVariabilitySample } from './HeartRateVariabilitySample'
import type { HeightSample } from './HeightSample'
import type { HeightSampleInput } from './HeightSampleInput'
import type { LeanBodyMassSample } from './LeanBodyMassSample'
import type { LeanBodyMassSampleInput } from './LeanBodyMassSampleInput'
import type { OxygenSaturationSample } from './OxygenSaturationSample'
import type { OxygenSaturationSampleInput } from './OxygenSaturationSampleInput'
import type { RespiratoryRateSample } from './RespiratoryRateSample'
import type { RespiratoryRateSampleInput } from './RespiratoryRateSampleInput'
import type { RestingHeartRateSample } from './RestingHeartRateSample'
import type { RestingHeartRateSampleInput } from './RestingHeartRateSampleInput'
import type { SleepSample } from './SleepSample'
import type { SleepSessionInput } from './SleepSessionInput'
import type { StepSample } from './StepSample'
import type { StepSampleInput } from './StepSampleInput'
import type { WorkoutSample } from './WorkoutSample'
import type { WorkoutSampleInput } from './WorkoutSampleInput'
import {
  makeNativeSampleQuery,
  makeNativeStatisticsQuery,
  makeNativeTimeRangeQuery,
} from './internal/queryMapping'
import {
  makeActiveEnergyBurnedSample,
  makeBasalBodyTemperatureSample,
  makeBloodGlucoseSample,
  makeBloodPressureSample,
  makeBodyFatSample,
  makeBodyTemperatureSample,
  makeBodyMassSample,
  makeDistanceSample,
  makeDistanceWriteResult,
  makeHealthChangesResult,
  makeHealthStatistics,
  makeHeartRateSample,
  makeHeartRateStatistics,
  makeHeartRateVariabilitySample,
  makeHeightSample,
  makeLeanBodyMassSample,
  makeNativeActiveEnergyBurnedSampleInput,
  makeNativeBasalBodyTemperatureSampleInput,
  makeNativeBloodGlucoseSampleInput,
  makeNativeBloodPressureSampleInput,
  makeNativeBodyFatSampleInput,
  makeNativeBodyTemperatureSampleInput,
  makeNativeBodyMassSampleInput,
  makeNativeDistanceSampleInput,
  makeNativeHeartRateSampleInput,
  makeNativeHeightSampleInput,
  makeNativeLeanBodyMassSampleInput,
  makeNativeOxygenSaturationSampleInput,
  makeNativeRespiratoryRateSampleInput,
  makeNativeRestingHeartRateSampleInput,
  makeNativeSleepSessionInput,
  makeNativeStepSampleInput,
  makeNativeWorkoutSampleInput,
  makeOxygenSaturationSample,
  makeRespiratoryRateSample,
  makeRestingHeartRateSample,
  makeSamplePage,
  makeSleepSample,
  makeStepSample,
  makeWorkoutSample,
} from './internal/sampleMapping'
import {
  assertChangesToken,
  assertNonEmptySamples,
  assertNonEmptySessions,
  assertPermissions,
  assertRecordIdentities,
  assertUniqueSampleSyncIds,
  parseHealthDataTypes,
} from './internal/validation'
import {
  makeAdditionalAccessResult,
  makeAvailabilityRecoveryResult,
  makeBackgroundChangesResult,
  makeHealthAuthorizationResult,
  makeHealthAvailability,
  makeHealthCapabilities,
  makeHealthPermissionStatusResult,
  makeIdentityDeleteResult,
  makePermissionManagementResult,
  makePermissionRevocationResult,
  makeTimeRangeDeleteResult,
} from './internal/workflowMapping'
import type { NitroHealth as NitroHealthSpec } from './specs/nitro-health.nitro'

const NitroHealthNative = NitroModules.createHybridObject<NitroHealthSpec>('NitroHealth')

const changeNotificationListeners = new Map<
  number,
  (notification: HealthChangeNotification) => void
>()
let nextChangeNotificationListenerId = 1
let isDispatchingChangeNotification = false

function notifyChangeNotificationListeners(dataTypes: string[], deliveryId: string): void {
  const notification: HealthChangeNotification = {
    dataTypes: [...new Set(parseHealthDataTypes(dataTypes, 'notification.dataTypes'))],
  }
  const listeners = [...changeNotificationListeners.values()]
  if (listeners.length === 0) return

  let firstError: unknown
  isDispatchingChangeNotification = true
  try {
    for (const listener of listeners) {
      try {
        listener(notification)
      } catch (error) {
        if (firstError === undefined) firstError = error
      }
    }

    if (!NitroHealthNative.acknowledgeBackgroundChange(deliveryId)) {
      throw new Error('Native observer did not acknowledge its background change delivery')
    }
  } finally {
    isDispatchingChangeNotification = false
  }

  if (changeNotificationListeners.size === 0) {
    NitroHealthNative.setOnBackgroundChangeListener(undefined)
  }

  if (firstError !== undefined) {
    setTimeout(() => {
      throw firstError
    }, 0)
  }
}

/** Unified consumer-facing health workflows. */
export interface NitroHealth {
  /** Returns health-service availability and actionable recovery when one exists. */
  getAvailability(): HealthAvailability
  /** Opens the recovery destination supplied by {@linkcode getAvailability}. */
  performAvailabilityRecovery(
    recovery: HealthAvailabilityRecovery
  ): Promise<HealthAvailabilityRecoveryResult>
  /** Returns runtime capability and additional-access states. */
  getCapabilities(): Promise<HealthCapabilitiesResult>
  /** Requests optional background or historical read access when requestable. */
  requestAdditionalAccess(
    access: HealthAdditionalAccess
  ): Promise<RequestHealthAdditionalAccessResult>
  /** Opens or describes the system workflow for managing health permissions. */
  managePermissions(): Promise<HealthPermissionManagementResult>
  /** Revokes health permissions directly or describes the required manual action. */
  revokeAllPermissions(): Promise<HealthPermissionRevocationResult>
  /** Configures observer delivery or reports app-owned polling requirements. */
  configureBackgroundChanges(
    configuration: BackgroundChangesConfiguration
  ): Promise<BackgroundChangesConfigurationResult>
  /** Disables observer delivery or reports app-owned polling cleanup requirements. */
  disableBackgroundChanges(
    dataTypes?: HealthDataType[]
  ): Promise<BackgroundChangesConfigurationResult>
  /** Subscribes to observer hints or reports that app-owned polling is required. */
  subscribeToBackgroundChanges(
    listener: (notification: HealthChangeNotification) => void
  ): BackgroundChangesSubscriptionResult
  /** Creates a durable checkpoint for future changes to one health data type. */
  createChangesToken(dataType: HealthDataType): Promise<string>
  /** Reads record changes after a checkpoint created for the same data type. */
  getChanges<T extends HealthDataType>(
    dataType: T,
    changesToken: string
  ): Promise<HealthChangesResult<T>>
  /** Returns current permission states without opening system authorization UI. */
  getPermissionStatuses(permissions: HealthPermission[]): Promise<HealthPermissionStatusResult>
  /** Runs authorization and returns one observable post-request state per permission. */
  requestAuthorization(permissions: HealthPermission[]): Promise<HealthAuthorizationResult>
  readSteps(query: HealthDateRangeQuery): Promise<HealthSamplePage<StepSample>>
  readDistance(query: HealthDateRangeQuery): Promise<HealthSamplePage<DistanceSample>>
  readActiveEnergyBurned(
    query: HealthDateRangeQuery
  ): Promise<HealthSamplePage<ActiveEnergyBurnedSample>>
  readBodyMass(query: HealthDateRangeQuery): Promise<HealthSamplePage<BodyMassSample>>
  readHeartRate(query: HealthDateRangeQuery): Promise<HealthSamplePage<HeartRateSample>>
  readBloodPressure(query: HealthDateRangeQuery): Promise<HealthSamplePage<BloodPressureSample>>
  readBloodGlucose(query: HealthDateRangeQuery): Promise<HealthSamplePage<BloodGlucoseSample>>
  readBodyTemperature(query: HealthDateRangeQuery): Promise<HealthSamplePage<BodyTemperatureSample>>
  readRespiratoryRate(query: HealthDateRangeQuery): Promise<HealthSamplePage<RespiratoryRateSample>>
  readBodyFat(query: HealthDateRangeQuery): Promise<HealthSamplePage<BodyFatSample>>
  readLeanBodyMass(query: HealthDateRangeQuery): Promise<HealthSamplePage<LeanBodyMassSample>>
  readBasalBodyTemperature(
    query: HealthDateRangeQuery
  ): Promise<HealthSamplePage<BasalBodyTemperatureSample>>
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
  readStatistics<T extends HealthDataType>(
    dataType: T,
    query: HealthStatisticsQuery
  ): Promise<Array<HealthStatisticsByDataType<T>>>
  readSleepSamples(query: HealthDateRangeQuery): Promise<HealthSamplePage<SleepSample>>
  readWorkouts(query: HealthDateRangeQuery): Promise<HealthSamplePage<WorkoutSample>>
  saveSteps(samples: StepSampleInput[]): Promise<void>
  saveDistance(samples: DistanceSampleInput[]): Promise<DistanceWriteResult>
  saveActiveEnergyBurned(samples: ActiveEnergyBurnedSampleInput[]): Promise<void>
  saveHeartRate(samples: HeartRateSampleInput[]): Promise<void>
  saveBloodPressure(samples: BloodPressureSampleInput[]): Promise<void>
  saveBloodGlucose(samples: BloodGlucoseSampleInput[]): Promise<void>
  saveBodyTemperature(samples: BodyTemperatureSampleInput[]): Promise<void>
  saveRespiratoryRate(samples: RespiratoryRateSampleInput[]): Promise<void>
  saveBodyFat(samples: BodyFatSampleInput[]): Promise<void>
  saveLeanBodyMass(samples: LeanBodyMassSampleInput[]): Promise<void>
  saveBasalBodyTemperature(samples: BasalBodyTemperatureSampleInput[]): Promise<void>
  saveBodyMass(samples: BodyMassSampleInput[]): Promise<void>
  saveRestingHeartRate(samples: RestingHeartRateSampleInput[]): Promise<void>
  saveOxygenSaturation(samples: OxygenSaturationSampleInput[]): Promise<void>
  saveHeight(samples: HeightSampleInput[]): Promise<void>
  saveSleepSessions(sessions: SleepSessionInput[]): Promise<void>
  saveWorkout(workout: WorkoutSampleInput): Promise<void>
  /** Deletes independently deletable records by physical identity. */
  deleteRecordsByIds(
    dataType: HealthDataType,
    records: HealthRecordIdentity[]
  ): Promise<HealthIdentityDeleteResult>
  /** Deletes caller-owned records overlapping a time range. */
  deleteRecordsByTimeRange(
    dataType: HealthDataType,
    query: HealthTimeRangeQuery
  ): Promise<HealthTimeRangeDeleteResult>
}

export const NitroHealth: NitroHealth = {
  getAvailability() {
    return makeHealthAvailability(NitroHealthNative.getAvailability())
  },
  async performAvailabilityRecovery(recovery) {
    if (recovery.kind !== 'install-or-update-provider') {
      throw new Error('Unsupported health availability recovery action')
    }
    return makeAvailabilityRecoveryResult(await NitroHealthNative.performAvailabilityRecovery())
  },
  async getCapabilities() {
    const availability = makeHealthAvailability(NitroHealthNative.getAvailability())
    if (availability.status === 'unavailable') {
      return { status: 'unavailable', availability }
    }
    return {
      status: 'available',
      ...makeHealthCapabilities(await NitroHealthNative.getCapabilities()),
    }
  },
  async requestAdditionalAccess(access) {
    if (access !== 'background-read' && access !== 'history-read') {
      throw new Error('access must be background-read or history-read')
    }
    const availability = makeHealthAvailability(NitroHealthNative.getAvailability())
    if (availability.status === 'unavailable') {
      return { access, status: 'unavailable', availability }
    }
    return makeAdditionalAccessResult(
      access,
      await NitroHealthNative.requestAdditionalAccess(access)
    )
  },
  async managePermissions() {
    return makePermissionManagementResult(await NitroHealthNative.managePermissions())
  },
  async revokeAllPermissions() {
    return makePermissionRevocationResult(await NitroHealthNative.revokeAllPermissions())
  },
  async configureBackgroundChanges(configuration) {
    if (configuration.dataTypes.length === 0) {
      throw new Error('At least one background change data type is required')
    }
    return makeBackgroundChangesResult(
      await NitroHealthNative.configureBackgroundChanges(
        [...new Set(parseHealthDataTypes(configuration.dataTypes, 'configuration.dataTypes'))],
        configuration.frequency
      )
    )
  },
  async disableBackgroundChanges(dataTypes) {
    if (dataTypes !== undefined && dataTypes.length === 0) {
      throw new Error('dataTypes must be omitted or contain at least one health data type')
    }
    return makeBackgroundChangesResult(
      await NitroHealthNative.disableBackgroundChanges(
        dataTypes === undefined
          ? undefined
          : [...new Set(parseHealthDataTypes(dataTypes, 'dataTypes'))]
      )
    )
  },
  subscribeToBackgroundChanges(listener) {
    if (typeof listener !== 'function') {
      throw new Error('A background change listener function is required')
    }
    const availability = makeHealthAvailability(NitroHealthNative.getAvailability())
    if (availability.status === 'unavailable') {
      return { mode: 'unavailable', availability }
    }
    if (NitroHealthNative.getBackgroundChangesMode() === 'polling') {
      return { mode: 'polling', scheduling: 'app-owned' }
    }

    if (changeNotificationListeners.size === 0) {
      if (!NitroHealthNative.setOnBackgroundChangeListener(notifyChangeNotificationListeners)) {
        throw new Error('Native observer listener registration is unavailable')
      }
    }
    const listenerId = nextChangeNotificationListenerId
    nextChangeNotificationListenerId += 1
    changeNotificationListeners.set(listenerId, listener)
    let isRemoved = false

    return {
      mode: 'observer',
      subscription: {
        remove() {
          if (isRemoved) return
          isRemoved = true
          changeNotificationListeners.delete(listenerId)
          if (changeNotificationListeners.size === 0 && !isDispatchingChangeNotification) {
            NitroHealthNative.setOnBackgroundChangeListener(undefined)
          }
        },
      },
    }
  },
  createChangesToken(dataType) {
    return NitroHealthNative.createChangesToken(dataType)
  },
  async getChanges(dataType, changesToken) {
    assertChangesToken(changesToken)
    return makeHealthChangesResult(
      dataType,
      await NitroHealthNative.getChanges(dataType, changesToken)
    )
  },
  async getPermissionStatuses(permissions) {
    assertPermissions(permissions)
    return makeHealthPermissionStatusResult(
      await NitroHealthNative.getPermissionStatuses(permissions),
      permissions
    )
  },
  async requestAuthorization(permissions) {
    assertPermissions(permissions)
    return makeHealthAuthorizationResult(
      await NitroHealthNative.requestAuthorization(permissions),
      permissions
    )
  },
  async readSteps(query) {
    return makeSamplePage(
      await NitroHealthNative.readSteps(makeNativeSampleQuery(query)),
      makeStepSample
    )
  },
  async readDistance(query) {
    return makeSamplePage(
      await NitroHealthNative.readDistance(makeNativeSampleQuery(query)),
      makeDistanceSample
    )
  },
  async readActiveEnergyBurned(query) {
    return makeSamplePage(
      await NitroHealthNative.readActiveEnergyBurned(makeNativeSampleQuery(query)),
      makeActiveEnergyBurnedSample
    )
  },
  async readBodyMass(query) {
    return makeSamplePage(
      await NitroHealthNative.readBodyMass(makeNativeSampleQuery(query)),
      makeBodyMassSample
    )
  },
  async readHeartRate(query) {
    return makeSamplePage(
      await NitroHealthNative.readHeartRate(makeNativeSampleQuery(query)),
      makeHeartRateSample
    )
  },
  async readBloodPressure(query) {
    return makeSamplePage(
      await NitroHealthNative.readBloodPressure(makeNativeSampleQuery(query)),
      makeBloodPressureSample
    )
  },
  async readBloodGlucose(query) {
    return makeSamplePage(
      await NitroHealthNative.readBloodGlucose(makeNativeSampleQuery(query)),
      makeBloodGlucoseSample
    )
  },
  async readBodyTemperature(query) {
    return makeSamplePage(
      await NitroHealthNative.readBodyTemperature(makeNativeSampleQuery(query)),
      makeBodyTemperatureSample
    )
  },
  async readRespiratoryRate(query) {
    return makeSamplePage(
      await NitroHealthNative.readRespiratoryRate(makeNativeSampleQuery(query)),
      makeRespiratoryRateSample
    )
  },
  async readBodyFat(query) {
    return makeSamplePage(
      await NitroHealthNative.readBodyFat(makeNativeSampleQuery(query)),
      makeBodyFatSample
    )
  },
  async readLeanBodyMass(query) {
    return makeSamplePage(
      await NitroHealthNative.readLeanBodyMass(makeNativeSampleQuery(query)),
      makeLeanBodyMassSample
    )
  },
  async readBasalBodyTemperature(query) {
    return makeSamplePage(
      await NitroHealthNative.readBasalBodyTemperature(makeNativeSampleQuery(query)),
      makeBasalBodyTemperatureSample
    )
  },
  async readHeartRateStatistics(query) {
    return makeHeartRateStatistics(
      await NitroHealthNative.readHeartRateStatistics(makeNativeTimeRangeQuery(query))
    )
  },
  async readRestingHeartRate(query) {
    return makeSamplePage(
      await NitroHealthNative.readRestingHeartRate(makeNativeSampleQuery(query)),
      makeRestingHeartRateSample
    )
  },
  async readHeartRateVariability(query) {
    return makeSamplePage(
      await NitroHealthNative.readHeartRateVariability(makeNativeSampleQuery(query)),
      makeHeartRateVariabilitySample
    )
  },
  async readOxygenSaturation(query) {
    return makeSamplePage(
      await NitroHealthNative.readOxygenSaturation(makeNativeSampleQuery(query)),
      makeOxygenSaturationSample
    )
  },
  async readHeight(query) {
    return makeSamplePage(
      await NitroHealthNative.readHeight(makeNativeSampleQuery(query)),
      makeHeightSample
    )
  },
  async readStatistics(dataType, query) {
    const statistics = await NitroHealthNative.readStatistics(
      dataType,
      makeNativeStatisticsQuery(dataType, query)
    )
    return statistics.map((bucket) => makeHealthStatistics(dataType, bucket))
  },
  async readSleepSamples(query) {
    return makeSamplePage(
      await NitroHealthNative.readSleepSamples(makeNativeSampleQuery(query)),
      makeSleepSample
    )
  },
  async readWorkouts(query) {
    return makeSamplePage(
      await NitroHealthNative.readWorkouts(makeNativeSampleQuery(query)),
      makeWorkoutSample
    )
  },
  async saveSteps(samples) {
    assertNonEmptySamples(samples)
    const nativeSamples = samples.map(makeNativeStepSampleInput)
    assertUniqueSampleSyncIds(samples)
    return NitroHealthNative.saveSteps(nativeSamples)
  },
  async saveDistance(samples) {
    assertNonEmptySamples(samples)
    const nativeSamples = samples.map(makeNativeDistanceSampleInput)
    assertUniqueSampleSyncIds(samples)
    return makeDistanceWriteResult(await NitroHealthNative.saveDistance(nativeSamples))
  },
  async saveActiveEnergyBurned(samples) {
    assertNonEmptySamples(samples)
    const nativeSamples = samples.map(makeNativeActiveEnergyBurnedSampleInput)
    assertUniqueSampleSyncIds(samples)
    return NitroHealthNative.saveActiveEnergyBurned(nativeSamples)
  },
  async saveHeartRate(samples) {
    assertNonEmptySamples(samples)
    const nativeSamples = samples.map(makeNativeHeartRateSampleInput)
    assertUniqueSampleSyncIds(samples)
    return NitroHealthNative.saveHeartRate(nativeSamples)
  },
  async saveBloodPressure(samples) {
    assertNonEmptySamples(samples)
    const nativeSamples = samples.map(makeNativeBloodPressureSampleInput)
    assertUniqueSampleSyncIds(samples)
    return NitroHealthNative.saveBloodPressure(nativeSamples)
  },
  async saveBloodGlucose(samples) {
    assertNonEmptySamples(samples)
    const nativeSamples = samples.map(makeNativeBloodGlucoseSampleInput)
    assertUniqueSampleSyncIds(samples)
    return NitroHealthNative.saveBloodGlucose(nativeSamples)
  },
  async saveBodyTemperature(samples) {
    assertNonEmptySamples(samples)
    const nativeSamples = samples.map(makeNativeBodyTemperatureSampleInput)
    assertUniqueSampleSyncIds(samples)
    return NitroHealthNative.saveBodyTemperature(nativeSamples)
  },
  async saveRespiratoryRate(samples) {
    assertNonEmptySamples(samples)
    const nativeSamples = samples.map(makeNativeRespiratoryRateSampleInput)
    assertUniqueSampleSyncIds(samples)
    return NitroHealthNative.saveRespiratoryRate(nativeSamples)
  },
  async saveBodyFat(samples) {
    assertNonEmptySamples(samples)
    const nativeSamples = samples.map(makeNativeBodyFatSampleInput)
    assertUniqueSampleSyncIds(samples)
    return NitroHealthNative.saveBodyFat(nativeSamples)
  },
  async saveLeanBodyMass(samples) {
    assertNonEmptySamples(samples)
    const nativeSamples = samples.map(makeNativeLeanBodyMassSampleInput)
    assertUniqueSampleSyncIds(samples)
    return NitroHealthNative.saveLeanBodyMass(nativeSamples)
  },
  async saveBasalBodyTemperature(samples) {
    assertNonEmptySamples(samples)
    const nativeSamples = samples.map(makeNativeBasalBodyTemperatureSampleInput)
    assertUniqueSampleSyncIds(samples)
    return NitroHealthNative.saveBasalBodyTemperature(nativeSamples)
  },
  async saveBodyMass(samples) {
    assertNonEmptySamples(samples)
    const nativeSamples = samples.map(makeNativeBodyMassSampleInput)
    assertUniqueSampleSyncIds(samples)
    return NitroHealthNative.saveBodyMass(nativeSamples)
  },
  async saveRestingHeartRate(samples) {
    assertNonEmptySamples(samples)
    const nativeSamples = samples.map(makeNativeRestingHeartRateSampleInput)
    assertUniqueSampleSyncIds(samples)
    return NitroHealthNative.saveRestingHeartRate(nativeSamples)
  },
  async saveOxygenSaturation(samples) {
    assertNonEmptySamples(samples)
    const nativeSamples = samples.map(makeNativeOxygenSaturationSampleInput)
    assertUniqueSampleSyncIds(samples)
    return NitroHealthNative.saveOxygenSaturation(nativeSamples)
  },
  async saveHeight(samples) {
    assertNonEmptySamples(samples)
    const nativeSamples = samples.map(makeNativeHeightSampleInput)
    assertUniqueSampleSyncIds(samples)
    return NitroHealthNative.saveHeight(nativeSamples)
  },
  async saveSleepSessions(sessions) {
    assertNonEmptySessions(sessions)
    return NitroHealthNative.saveSleepSessions(sessions.map(makeNativeSleepSessionInput))
  },
  async saveWorkout(workout) {
    return NitroHealthNative.saveWorkout(makeNativeWorkoutSampleInput(workout))
  },
  async deleteRecordsByIds(dataType, records) {
    assertRecordIdentities(records)
    return makeIdentityDeleteResult(
      await NitroHealthNative.deleteRecordsByIds(
        dataType,
        records.map((record) => record.id)
      ),
      records.length
    )
  },
  async deleteRecordsByTimeRange(dataType, query) {
    return makeTimeRangeDeleteResult(
      await NitroHealthNative.deleteRecordsByTimeRange(dataType, makeNativeTimeRangeQuery(query))
    )
  },
}
