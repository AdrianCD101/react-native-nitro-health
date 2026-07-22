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
  | 'readActiveEnergyBurned'
  | 'readDailyActiveEnergyBurnedTotals'
  | 'readDailyDistanceTotals'
  | 'readSteps'
  | 'readDailyStepTotals'
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
  readActiveEnergyBurned: MockFunction<NitroHealth['readActiveEnergyBurned']>
  readDailyActiveEnergyBurnedTotals: MockFunction<NitroHealth['readDailyActiveEnergyBurnedTotals']>
  readDailyDistanceTotals: MockFunction<NitroHealth['readDailyDistanceTotals']>
  readSteps: MockFunction<NitroHealth['readSteps']>
  readDailyStepTotals: MockFunction<NitroHealth['readDailyStepTotals']>
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
