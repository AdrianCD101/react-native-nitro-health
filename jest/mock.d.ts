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
  | 'readSleepSamples'
  | 'saveSteps'
  | 'saveDistance'
  | 'saveActiveEnergyBurned'
  | 'saveHeartRate'
  | 'saveBodyMass'
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
  readSleepSamples: MockFunction<NitroHealth['readSleepSamples']>
  saveSteps: MockFunction<NitroHealth['saveSteps']>
  saveDistance: MockFunction<NitroHealth['saveDistance']>
  saveActiveEnergyBurned: MockFunction<NitroHealth['saveActiveEnergyBurned']>
  saveHeartRate: MockFunction<NitroHealth['saveHeartRate']>
  saveBodyMass: MockFunction<NitroHealth['saveBodyMass']>
  getRequestStatusForAuthorization: MockFunction<NitroHealth['getRequestStatusForAuthorization']>
  requestAuthorization: MockFunction<NitroHealth['requestAuthorization']>
}

export const NitroHealth: NitroHealthMock
export function createNitroHealthMock(overrides?: Partial<NitroHealthMock>): NitroHealthMock
export function resetNitroHealthMock(overrides?: Partial<NitroHealthMock>): NitroHealthMock
