import { NitroModules } from 'react-native-nitro-modules'
import type { NitroHealth as NitroHealthSpec } from './specs/nitro-health.nitro'
import type { ActiveEnergyBurnedSample } from './ActiveEnergyBurnedSample'
import type { ActiveEnergyBurnedSampleInput } from './ActiveEnergyBurnedSampleInput'
import type { BackgroundDeliveryFrequency } from './BackgroundDeliveryFrequency'
import type { BackgroundReadAuthorizationStatus } from './BackgroundReadAuthorizationStatus'
import type { BodyMassSample } from './BodyMassSample'
import type { BodyMassSampleInput } from './BodyMassSampleInput'
import type { DistanceSample } from './DistanceSample'
import type { DistanceSampleInput } from './DistanceSampleInput'
import type { HealthAuthorizationResult } from './HealthAuthorizationResult'
import type { HealthChangesResult } from './HealthChangesResult'
import type { HealthChangeNotification } from './HealthChangeNotification'
import type { HealthDataType } from './HealthDataType'
import type { HealthDateRangeQuery } from './HealthDateRangeQuery'
import type { HealthPermission } from './HealthPermission'
import type { HealthPermissionStatusResult } from './HealthPermissionStatusResult'
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
import type { ListenerSubscription } from './ListenerSubscription'
import type { OxygenSaturationSample } from './OxygenSaturationSample'
import type { OxygenSaturationSampleInput } from './OxygenSaturationSampleInput'
import type { RestingHeartRateSample } from './RestingHeartRateSample'
import type { RestingHeartRateSampleInput } from './RestingHeartRateSampleInput'
import type { SleepSample } from './SleepSample'
import type { SleepSessionInput } from './SleepSessionInput'
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
  makeHealthChangesResult,
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
  makeNativeSleepSessionInput,
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
  assertChangesToken,
  assertNonEmptySamples,
  assertNonEmptySessions,
  assertPermissions,
  assertUniqueSampleSyncIds,
} from './internal/validation'

export type { ActiveEnergyBurnedSample } from './ActiveEnergyBurnedSample'
export type { ActiveEnergyBurnedSampleInput } from './ActiveEnergyBurnedSampleInput'
export type { AuthorizationRequestStatus } from './AuthorizationRequestStatus'
export type { BackgroundDeliveryFrequency } from './BackgroundDeliveryFrequency'
export type { BackgroundReadAuthorizationStatus } from './BackgroundReadAuthorizationStatus'
export type { BodyMassSample } from './BodyMassSample'
export type { BodyMassSampleInput } from './BodyMassSampleInput'
export type { DistanceSample } from './DistanceSample'
export type { DistanceSampleInput } from './DistanceSampleInput'
export type { HealthAuthorizationResult } from './HealthAuthorizationResult'
export type { HealthAuthorizationStatus } from './HealthAuthorizationStatus'
export type { HealthAvailabilityStatus } from './HealthAvailabilityStatus'
export type { HealthChangesResult } from './HealthChangesResult'
export type { HealthChangeNotification } from './HealthChangeNotification'
export type { HealthDataType } from './HealthDataType'
export type { HealthDateRangeQuery } from './HealthDateRangeQuery'
export type { HealthPermission } from './HealthPermission'
export type { HealthPermissionAccessType } from './HealthPermissionAccessType'
export type { HealthPermissionStatus } from './HealthPermissionStatus'
export type { HealthPermissionStatusEntry } from './HealthPermissionStatusEntry'
export type { HealthPermissionStatusResult } from './HealthPermissionStatusResult'
export type { HealthRecordChange } from './HealthRecordChange'
export type { HealthRecordSync } from './HealthRecordSync'
export type { HealthSamplePage } from './HealthSamplePage'
export type { HealthSampleByDataType } from './HealthSampleByDataType'
export type { HealthSampleIdentity } from './HealthSampleIdentity'
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
export type { ListenerSubscription } from './ListenerSubscription'
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
export type { NativeHealthChange } from './NativeHealthChange'
export type { NativeHealthChangesResult } from './NativeHealthChangesResult'
export type { NativeHealthDateRangeQuery } from './NativeHealthDateRangeQuery'
export type { NativeHealthStatistics } from './NativeHealthStatistics'
export type { NativeHealthStatisticsQuery } from './NativeHealthStatisticsQuery'
export type { NativeHealthTimeRangeQuery } from './NativeHealthTimeRangeQuery'
export type { NativeHealthPermission } from './NativeHealthPermission'
export type { NativeHealthPermissionStatusEntry } from './NativeHealthPermissionStatusEntry'
export type { NativeHealthPermissionStatusResult } from './NativeHealthPermissionStatusResult'
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
export type { NativeSleepSessionInput } from './NativeSleepSessionInput'
export type { NativeSleepSessionStageInput } from './NativeSleepSessionStageInput'
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
export type { SleepSessionInput } from './SleepSessionInput'
export type { SleepSessionStageInput, WritableSleepStage } from './SleepSessionStageInput'
export type { SleepStage } from './SleepStage'
export type { StatisticsBucket } from './StatisticsBucket'
export type { StatisticsMetric } from './StatisticsMetric'
export type { StepSample } from './StepSample'
export type { StepSampleInput } from './StepSampleInput'
export type { WorkoutActivityType } from './WorkoutActivityType'
export type { WorkoutSample } from './WorkoutSample'

const NitroHealthNative = NitroModules.createHybridObject<NitroHealthSpec>('NitroHealth')

const changeNotificationListeners = new Map<
  number,
  (notification: HealthChangeNotification) => void
>()
let nextChangeNotificationListenerId = 1
let isDispatchingChangeNotification = false

function notifyChangeNotificationListeners(dataTypes: string[], deliveryId: string): void {
  const notification: HealthChangeNotification = {
    dataTypes: [...new Set(dataTypes)] as HealthDataType[],
  }
  const listeners = [...changeNotificationListeners.values()]
  if (listeners.length === 0) return

  let hasError = false
  let firstError: unknown

  isDispatchingChangeNotification = true
  try {
    for (const listener of listeners) {
      try {
        listener(notification)
      } catch (error) {
        if (!hasError) {
          hasError = true
          firstError = error
        }
      }
    }

    NitroHealthNative.acknowledgeChangeNotification(deliveryId)
  } finally {
    isDispatchingChangeNotification = false
  }

  // Detaching before the acknowledgement would clear the in-flight delivery and
  // orphan the pending notification, so a remove() during dispatch defers to here.
  if (changeNotificationListeners.size === 0) {
    NitroHealthNative.setOnChangeNotificationListener(undefined)
  }

  if (hasError) {
    setTimeout(() => {
      throw firstError
    }, 0)
  }
}

export type NitroHealth = Omit<
  NitroHealthSpec,
  | 'getPermissionStatuses'
  | 'getRequestStatusForAuthorization'
  | 'enableBackgroundDelivery'
  | 'disableBackgroundDelivery'
  | 'disableAllBackgroundDelivery'
  | 'setOnChangeNotificationListener'
  | 'acknowledgeChangeNotification'
  | 'createChangesToken'
  | 'getChanges'
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
  | 'saveSleepSessions'
  | 'deleteSamplesByUuids'
  | 'deleteSamplesByTimeRange'
  | 'requestAuthorization'
> & {
  /**
   * Enables persistent HealthKit background delivery for one data type.
   *
   * @platform iOS
   * @throws On Android or when HealthKit cannot enable delivery.
   */
  enableBackgroundDelivery(
    dataType: HealthDataType,
    frequency: BackgroundDeliveryFrequency
  ): Promise<void>
  /**
   * Disables persistent HealthKit background delivery for one data type.
   *
   * @platform iOS
   */
  disableBackgroundDelivery(dataType: HealthDataType): Promise<void>
  /** Disables every background delivery type configured through Nitro Health. */
  disableAllBackgroundDelivery(): Promise<void>
  /**
   * Adds an iOS change-notification listener. Notifications are hints to drain change tokens.
   *
   * @platform iOS
   * @throws On Android.
   */
  addOnChangeNotificationListener(
    listener: (notification: HealthChangeNotification) => void
  ): ListenerSubscription
  /** Returns Android Health Connect's background-read authorization state. */
  getBackgroundReadAuthorizationStatus(): Promise<BackgroundReadAuthorizationStatus>
  /** Requests Android Health Connect background-read authorization when available. */
  requestBackgroundReadAuthorization(): Promise<BackgroundReadAuthorizationStatus>
  /** Creates a durable checkpoint for future changes to one health data type. */
  createChangesToken(dataType: HealthDataType): Promise<string>
  /** Reads record changes after a checkpoint created for the same data type. */
  getChanges<T extends HealthDataType>(
    dataType: T,
    changesToken: string
  ): Promise<HealthChangesResult<T>>
  /** Returns current permission states without opening system authorization UI. */
  getPermissionStatuses(permissions: HealthPermission[]): Promise<HealthPermissionStatusResult>
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
  /** Saves complete sleep sessions. Retries are not idempotent and may create duplicates. */
  saveSleepSessions(sessions: SleepSessionInput[]): Promise<void>
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
    if (changeNotificationListeners.size > 0) {
      NitroHealthNative.setOnChangeNotificationListener(undefined)
    }
    changeNotificationListeners.clear()
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
  enableBackgroundDelivery(dataType, frequency) {
    return NitroHealthNative.enableBackgroundDelivery(dataType, frequency)
  },
  disableBackgroundDelivery(dataType) {
    return NitroHealthNative.disableBackgroundDelivery(dataType)
  },
  disableAllBackgroundDelivery() {
    return NitroHealthNative.disableAllBackgroundDelivery()
  },
  addOnChangeNotificationListener(listener) {
    if (typeof listener !== 'function') {
      throw new Error('A change notification listener function is required')
    }

    if (changeNotificationListeners.size === 0) {
      NitroHealthNative.setOnChangeNotificationListener(notifyChangeNotificationListeners)
    }

    const listenerId = nextChangeNotificationListenerId
    nextChangeNotificationListenerId += 1
    changeNotificationListeners.set(listenerId, listener)
    let isRemoved = false

    return {
      remove() {
        if (isRemoved) return
        isRemoved = true
        changeNotificationListeners.delete(listenerId)

        if (changeNotificationListeners.size === 0 && !isDispatchingChangeNotification) {
          NitroHealthNative.setOnChangeNotificationListener(undefined)
        }
      },
    }
  },
  getBackgroundReadAuthorizationStatus() {
    return NitroHealthNative.getBackgroundReadAuthorizationStatus()
  },
  requestBackgroundReadAuthorization() {
    return NitroHealthNative.requestBackgroundReadAuthorization()
  },
  createChangesToken(dataType) {
    return NitroHealthNative.createChangesToken(dataType)
  },
  async getChanges(dataType, changesToken) {
    assertChangesToken(changesToken)
    const result = await NitroHealthNative.getChanges(dataType, changesToken)

    return makeHealthChangesResult(dataType, result)
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
    const nativeSamples = samples.map(makeNativeStepSampleInput)
    assertUniqueSampleSyncIds(samples)
    return NitroHealthNative.saveSteps(nativeSamples)
  },
  async saveDistance(samples) {
    assertNonEmptySamples(samples)
    const nativeSamples = samples.map(makeNativeDistanceSampleInput)
    assertUniqueSampleSyncIds(samples)
    return NitroHealthNative.saveDistance(nativeSamples)
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
    const nativeSessions = sessions.map(makeNativeSleepSessionInput)
    return NitroHealthNative.saveSleepSessions(nativeSessions)
  },
  async deleteSamplesByUuids(dataType, uuids) {
    assertDeletableUuids(uuids)
    return NitroHealthNative.deleteSamplesByUuids(dataType, uuids)
  },
  async deleteSamplesByTimeRange(dataType, query) {
    return NitroHealthNative.deleteSamplesByTimeRange(dataType, makeNativeTimeRangeQuery(query))
  },
  async getPermissionStatuses(permissions) {
    assertPermissions(permissions)
    return NitroHealthNative.getPermissionStatuses(
      permissions
    ) as Promise<HealthPermissionStatusResult>
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
