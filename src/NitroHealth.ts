import { NitroModules } from 'react-native-nitro-modules'
import type { ActiveEnergyBurnedSample } from './ActiveEnergyBurnedSample'
import type { ActiveEnergyBurnedSampleInput } from './ActiveEnergyBurnedSampleInput'
import type { FloorsClimbedSample } from './FloorsClimbedSample'
import type { FloorsClimbedSampleInput } from './FloorsClimbedSampleInput'
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
import type { HealthDataType, HealthStatisticsDataType } from './HealthDataType'
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
import type { HealthWriteResult } from './HealthWriteResult'
import type { HeartRateSample } from './HeartRateSample'
import type { HeartRateSampleInput } from './HeartRateSampleInput'
import type { HeartRateStatistics } from './HeartRateStatistics'
import type { HeartRateVariabilitySample } from './HeartRateVariabilitySample'
import type { HeightSample } from './HeightSample'
import type { HeightSampleInput } from './HeightSampleInput'
import type { HydrationSample } from './HydrationSample'
import type { HydrationSampleInput } from './HydrationSampleInput'
import type { Vo2MaxSample } from './Vo2MaxSample'
import type { Vo2MaxSampleInput } from './Vo2MaxSampleInput'
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
  makeNativeActiveEnergyBurnedSampleInput,
  makeNativeFloorsClimbedSampleInput,
  makeNativeBasalBodyTemperatureSampleInput,
  makeNativeBloodGlucoseSampleInput,
  makeNativeBloodPressureSampleInput,
  makeNativeBodyFatSampleInput,
  makeNativeBodyTemperatureSampleInput,
  makeNativeBodyMassSampleInput,
  makeNativeDistanceSampleInput,
  makeNativeHeartRateSampleInput,
  makeNativeHeightSampleInput,
  makeNativeHydrationSampleInput,
  makeNativeVo2MaxSampleInput,
  makeNativeLeanBodyMassSampleInput,
  makeNativeOxygenSaturationSampleInput,
  makeNativeRespiratoryRateSampleInput,
  makeNativeRestingHeartRateSampleInput,
  makeNativeSleepSessionInput,
  makeNativeStepSampleInput,
  makeNativeWorkoutSampleInput,
} from './internal/sampleInputMapping'
import {
  makeActiveEnergyBurnedSample,
  makeFloorsClimbedSample,
  makeBasalBodyTemperatureSample,
  makeBloodGlucoseSample,
  makeBloodPressureSample,
  makeBodyFatSample,
  makeBodyTemperatureSample,
  makeBodyMassSample,
  makeDistanceSample,
  makeDistanceWriteResult,
  makeHealthWriteResult,
  makeHeartRateSample,
  makeHeartRateVariabilitySample,
  makeHeightSample,
  makeHydrationSample,
  makeVo2MaxSample,
  makeLeanBodyMassSample,
  makeOxygenSaturationSample,
  makeRespiratoryRateSample,
  makeRestingHeartRateSample,
  makeSamplePage,
  makeSleepSample,
  makeStepSample,
  makeWorkoutSample,
} from './internal/sampleOutputMapping'
import { makeHealthChangesResult } from './internal/healthChangeMapping'
import { makeHealthStatistics, makeHeartRateStatistics } from './internal/statisticsMapping'
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
  /** Reads paginated hydration intervals in milliliters. */
  readHydration(query: HealthDateRangeQuery): Promise<HealthSamplePage<HydrationSample>>
  /** Reads paginated floors-climbed intervals. iOS maps HealthKit flights climbed to `floors`. */
  readFloorsClimbed(query: HealthDateRangeQuery): Promise<HealthSamplePage<FloorsClimbedSample>>
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
  readVo2Max(query: HealthDateRangeQuery): Promise<HealthSamplePage<Vo2MaxSample>>
  /**
   * Reads bucketed aggregates. Besides the raw-readable types, accepts the aggregate-only
   * energy types: `basalEnergyBurned` (iOS resting-energy sums; Android integrates stored
   * metabolic rates, estimating one from body metrics when none exist) and `totalEnergyBurned`
   * (Android stored totals; iOS composes active + basal and omits buckets without basal data).
   * Missing buckets mean "no data", never zero.
   */
  readStatistics<T extends HealthStatisticsDataType>(
    dataType: T,
    query: HealthStatisticsQuery
  ): Promise<Array<HealthStatisticsByDataType<T>>>
  readSleepSamples(query: HealthDateRangeQuery): Promise<HealthSamplePage<SleepSample>>
  readWorkouts(query: HealthDateRangeQuery): Promise<HealthSamplePage<WorkoutSample>>
  saveSteps(samples: StepSampleInput[]): Promise<HealthWriteResult>
  saveDistance(samples: DistanceSampleInput[]): Promise<DistanceWriteResult>
  saveActiveEnergyBurned(samples: ActiveEnergyBurnedSampleInput[]): Promise<HealthWriteResult>
  /** Saves hydration intervals in milliliters. */
  saveHydration(samples: HydrationSampleInput[]): Promise<HealthWriteResult>
  /** Saves floors-climbed intervals. iOS stores `floors` as HealthKit flights climbed. */
  saveFloorsClimbed(samples: FloorsClimbedSampleInput[]): Promise<HealthWriteResult>
  saveHeartRate(samples: HeartRateSampleInput[]): Promise<HealthWriteResult>
  saveBloodPressure(samples: BloodPressureSampleInput[]): Promise<HealthWriteResult>
  saveBloodGlucose(samples: BloodGlucoseSampleInput[]): Promise<HealthWriteResult>
  saveBodyTemperature(samples: BodyTemperatureSampleInput[]): Promise<HealthWriteResult>
  saveRespiratoryRate(samples: RespiratoryRateSampleInput[]): Promise<HealthWriteResult>
  saveBodyFat(samples: BodyFatSampleInput[]): Promise<HealthWriteResult>
  saveLeanBodyMass(samples: LeanBodyMassSampleInput[]): Promise<HealthWriteResult>
  saveBasalBodyTemperature(samples: BasalBodyTemperatureSampleInput[]): Promise<HealthWriteResult>
  saveBodyMass(samples: BodyMassSampleInput[]): Promise<HealthWriteResult>
  saveRestingHeartRate(samples: RestingHeartRateSampleInput[]): Promise<HealthWriteResult>
  saveOxygenSaturation(samples: OxygenSaturationSampleInput[]): Promise<HealthWriteResult>
  saveHeight(samples: HeightSampleInput[]): Promise<HealthWriteResult>
  saveVo2Max(samples: Vo2MaxSampleInput[]): Promise<HealthWriteResult>
  saveSleepSessions(sessions: SleepSessionInput[]): Promise<HealthWriteResult>
  /** Saves one workout and returns exactly one stored recording method. */
  saveWorkout(workout: WorkoutSampleInput): Promise<HealthWriteResult>
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
  async readHydration(query) {
    return makeSamplePage(
      await NitroHealthNative.readHydration(makeNativeSampleQuery(query)),
      makeHydrationSample
    )
  },
  async readFloorsClimbed(query) {
    return makeSamplePage(
      await NitroHealthNative.readFloorsClimbed(makeNativeSampleQuery(query)),
      makeFloorsClimbedSample
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
  async readVo2Max(query) {
    return makeSamplePage(
      await NitroHealthNative.readVo2Max(makeNativeSampleQuery(query)),
      makeVo2MaxSample
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
    return makeHealthWriteResult(await NitroHealthNative.saveSteps(nativeSamples), samples.length)
  },
  async saveDistance(samples) {
    assertNonEmptySamples(samples)
    const nativeSamples = samples.map(makeNativeDistanceSampleInput)
    assertUniqueSampleSyncIds(samples)
    return makeDistanceWriteResult(
      await NitroHealthNative.saveDistance(nativeSamples),
      samples.length
    )
  },
  async saveActiveEnergyBurned(samples) {
    assertNonEmptySamples(samples)
    const nativeSamples = samples.map(makeNativeActiveEnergyBurnedSampleInput)
    assertUniqueSampleSyncIds(samples)
    return makeHealthWriteResult(
      await NitroHealthNative.saveActiveEnergyBurned(nativeSamples),
      samples.length
    )
  },
  async saveHydration(samples) {
    assertNonEmptySamples(samples)
    const nativeSamples = samples.map(makeNativeHydrationSampleInput)
    assertUniqueSampleSyncIds(samples)
    return makeHealthWriteResult(
      await NitroHealthNative.saveHydration(nativeSamples),
      samples.length
    )
  },
  async saveFloorsClimbed(samples) {
    assertNonEmptySamples(samples)
    const nativeSamples = samples.map(makeNativeFloorsClimbedSampleInput)
    assertUniqueSampleSyncIds(samples)
    return makeHealthWriteResult(
      await NitroHealthNative.saveFloorsClimbed(nativeSamples),
      samples.length
    )
  },
  async saveHeartRate(samples) {
    assertNonEmptySamples(samples)
    const nativeSamples = samples.map(makeNativeHeartRateSampleInput)
    assertUniqueSampleSyncIds(samples)
    return makeHealthWriteResult(
      await NitroHealthNative.saveHeartRate(nativeSamples),
      samples.length
    )
  },
  async saveBloodPressure(samples) {
    assertNonEmptySamples(samples)
    const nativeSamples = samples.map(makeNativeBloodPressureSampleInput)
    assertUniqueSampleSyncIds(samples)
    return makeHealthWriteResult(
      await NitroHealthNative.saveBloodPressure(nativeSamples),
      samples.length
    )
  },
  async saveBloodGlucose(samples) {
    assertNonEmptySamples(samples)
    const nativeSamples = samples.map(makeNativeBloodGlucoseSampleInput)
    assertUniqueSampleSyncIds(samples)
    return makeHealthWriteResult(
      await NitroHealthNative.saveBloodGlucose(nativeSamples),
      samples.length
    )
  },
  async saveBodyTemperature(samples) {
    assertNonEmptySamples(samples)
    const nativeSamples = samples.map(makeNativeBodyTemperatureSampleInput)
    assertUniqueSampleSyncIds(samples)
    return makeHealthWriteResult(
      await NitroHealthNative.saveBodyTemperature(nativeSamples),
      samples.length
    )
  },
  async saveRespiratoryRate(samples) {
    assertNonEmptySamples(samples)
    const nativeSamples = samples.map(makeNativeRespiratoryRateSampleInput)
    assertUniqueSampleSyncIds(samples)
    return makeHealthWriteResult(
      await NitroHealthNative.saveRespiratoryRate(nativeSamples),
      samples.length
    )
  },
  async saveBodyFat(samples) {
    assertNonEmptySamples(samples)
    const nativeSamples = samples.map(makeNativeBodyFatSampleInput)
    assertUniqueSampleSyncIds(samples)
    return makeHealthWriteResult(await NitroHealthNative.saveBodyFat(nativeSamples), samples.length)
  },
  async saveLeanBodyMass(samples) {
    assertNonEmptySamples(samples)
    const nativeSamples = samples.map(makeNativeLeanBodyMassSampleInput)
    assertUniqueSampleSyncIds(samples)
    return makeHealthWriteResult(
      await NitroHealthNative.saveLeanBodyMass(nativeSamples),
      samples.length
    )
  },
  async saveBasalBodyTemperature(samples) {
    assertNonEmptySamples(samples)
    const nativeSamples = samples.map(makeNativeBasalBodyTemperatureSampleInput)
    assertUniqueSampleSyncIds(samples)
    return makeHealthWriteResult(
      await NitroHealthNative.saveBasalBodyTemperature(nativeSamples),
      samples.length
    )
  },
  async saveBodyMass(samples) {
    assertNonEmptySamples(samples)
    const nativeSamples = samples.map(makeNativeBodyMassSampleInput)
    assertUniqueSampleSyncIds(samples)
    return makeHealthWriteResult(
      await NitroHealthNative.saveBodyMass(nativeSamples),
      samples.length
    )
  },
  async saveRestingHeartRate(samples) {
    assertNonEmptySamples(samples)
    const nativeSamples = samples.map(makeNativeRestingHeartRateSampleInput)
    assertUniqueSampleSyncIds(samples)
    return makeHealthWriteResult(
      await NitroHealthNative.saveRestingHeartRate(nativeSamples),
      samples.length
    )
  },
  async saveOxygenSaturation(samples) {
    assertNonEmptySamples(samples)
    const nativeSamples = samples.map(makeNativeOxygenSaturationSampleInput)
    assertUniqueSampleSyncIds(samples)
    return makeHealthWriteResult(
      await NitroHealthNative.saveOxygenSaturation(nativeSamples),
      samples.length
    )
  },
  async saveHeight(samples) {
    assertNonEmptySamples(samples)
    const nativeSamples = samples.map(makeNativeHeightSampleInput)
    assertUniqueSampleSyncIds(samples)
    return makeHealthWriteResult(await NitroHealthNative.saveHeight(nativeSamples), samples.length)
  },
  async saveVo2Max(samples) {
    assertNonEmptySamples(samples)
    const nativeSamples = samples.map(makeNativeVo2MaxSampleInput)
    assertUniqueSampleSyncIds(samples)
    return makeHealthWriteResult(await NitroHealthNative.saveVo2Max(nativeSamples), samples.length)
  },
  async saveSleepSessions(sessions) {
    assertNonEmptySessions(sessions)
    return makeHealthWriteResult(
      await NitroHealthNative.saveSleepSessions(sessions.map(makeNativeSleepSessionInput)),
      sessions.length
    )
  },
  async saveWorkout(workout) {
    return makeHealthWriteResult(
      await NitroHealthNative.saveWorkout(makeNativeWorkoutSampleInput(workout)),
      1
    )
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
