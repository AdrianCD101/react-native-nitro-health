import type { NitroHealth } from '../src'

type MockFunction<T extends (...args: any[]) => any> = T & {
  mockClear(): void
  mockReset(): void
  mockImplementation(implementation: T): unknown
  mockResolvedValue(value: Awaited<ReturnType<T>>): unknown
  mockReturnValue(value: ReturnType<T>): unknown
}

export type NitroHealthMock = Omit<
  NitroHealth,
  | 'toString'
  | 'equals'
  | 'dispose'
  | 'isAvailable'
  | 'getAvailabilityStatus'
  | 'openHealthConnectInstall'
  | 'openHealthSettings'
  | 'enableBackgroundDelivery'
  | 'disableBackgroundDelivery'
  | 'disableAllBackgroundDelivery'
  | 'addOnChangeNotificationListener'
  | 'getBackgroundReadAuthorizationStatus'
  | 'requestBackgroundReadAuthorization'
  | 'createChangesToken'
  | 'getChanges'
  | 'readActiveEnergyBurned'
  | 'readSteps'
  | 'readDistance'
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
  | 'getRequestStatusForAuthorization'
  | 'requestAuthorization'
> & {
  toString: MockFunction<NitroHealth['toString']>
  equals: MockFunction<NitroHealth['equals']>
  dispose: MockFunction<NitroHealth['dispose']>
  isAvailable: MockFunction<NitroHealth['isAvailable']>
  getAvailabilityStatus: MockFunction<NitroHealth['getAvailabilityStatus']>
  openHealthConnectInstall: MockFunction<NitroHealth['openHealthConnectInstall']>
  openHealthSettings: MockFunction<NitroHealth['openHealthSettings']>
  enableBackgroundDelivery: MockFunction<NitroHealth['enableBackgroundDelivery']>
  disableBackgroundDelivery: MockFunction<NitroHealth['disableBackgroundDelivery']>
  disableAllBackgroundDelivery: MockFunction<NitroHealth['disableAllBackgroundDelivery']>
  addOnChangeNotificationListener: MockFunction<NitroHealth['addOnChangeNotificationListener']>
  getBackgroundReadAuthorizationStatus: MockFunction<
    NitroHealth['getBackgroundReadAuthorizationStatus']
  >
  requestBackgroundReadAuthorization: MockFunction<
    NitroHealth['requestBackgroundReadAuthorization']
  >
  createChangesToken: MockFunction<NitroHealth['createChangesToken']>
  getChanges: MockFunction<NitroHealth['getChanges']>
  readActiveEnergyBurned: MockFunction<NitroHealth['readActiveEnergyBurned']>
  readSteps: MockFunction<NitroHealth['readSteps']>
  readDistance: MockFunction<NitroHealth['readDistance']>
  readBodyMass: MockFunction<NitroHealth['readBodyMass']>
  readHeartRate: MockFunction<NitroHealth['readHeartRate']>
  readHeartRateStatistics: MockFunction<NitroHealth['readHeartRateStatistics']>
  readRestingHeartRate: MockFunction<NitroHealth['readRestingHeartRate']>
  readHeartRateVariability: MockFunction<NitroHealth['readHeartRateVariability']>
  readOxygenSaturation: MockFunction<NitroHealth['readOxygenSaturation']>
  readHeight: MockFunction<NitroHealth['readHeight']>
  readStatistics: MockFunction<NitroHealth['readStatistics']>
  readSleepSamples: MockFunction<NitroHealth['readSleepSamples']>
  readWorkouts: MockFunction<NitroHealth['readWorkouts']>
  saveSteps: MockFunction<NitroHealth['saveSteps']>
  saveDistance: MockFunction<NitroHealth['saveDistance']>
  saveActiveEnergyBurned: MockFunction<NitroHealth['saveActiveEnergyBurned']>
  saveHeartRate: MockFunction<NitroHealth['saveHeartRate']>
  saveBodyMass: MockFunction<NitroHealth['saveBodyMass']>
  saveRestingHeartRate: MockFunction<NitroHealth['saveRestingHeartRate']>
  saveOxygenSaturation: MockFunction<NitroHealth['saveOxygenSaturation']>
  saveHeight: MockFunction<NitroHealth['saveHeight']>
  saveSleepSessions: MockFunction<NitroHealth['saveSleepSessions']>
  deleteSamplesByUuids: MockFunction<NitroHealth['deleteSamplesByUuids']>
  deleteSamplesByTimeRange: MockFunction<NitroHealth['deleteSamplesByTimeRange']>
  getRequestStatusForAuthorization: MockFunction<NitroHealth['getRequestStatusForAuthorization']>
  requestAuthorization: MockFunction<NitroHealth['requestAuthorization']>
}

// 'toString' is omitted from the override surface: every object literal inherits
// Object.prototype.toString (typed '() => string'), which structurally conflicts with
// MockFunction<() => string> and would reject all literal overrides.
export type NitroHealthMockOverrides = Partial<Omit<NitroHealthMock, 'toString'>>

export const NitroHealth: NitroHealthMock
export function createNitroHealthMock(overrides?: NitroHealthMockOverrides): NitroHealthMock
export function resetNitroHealthMock(overrides?: NitroHealthMockOverrides): NitroHealthMock
