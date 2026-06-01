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
  | 'readSteps'
  | 'readDailyStepTotals'
  | 'readHeartRate'
  | 'readHeartRateStatistics'
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
  readSteps: MockFunction<NitroHealth['readSteps']>
  readDailyStepTotals: MockFunction<NitroHealth['readDailyStepTotals']>
  readHeartRate: MockFunction<NitroHealth['readHeartRate']>
  readHeartRateStatistics: MockFunction<NitroHealth['readHeartRateStatistics']>
  getRequestStatusForAuthorization: MockFunction<NitroHealth['getRequestStatusForAuthorization']>
  requestAuthorization: MockFunction<NitroHealth['requestAuthorization']>
}

export const NitroHealth: NitroHealthMock
export function createNitroHealthMock(overrides?: Partial<NitroHealthMock>): NitroHealthMock
export function resetNitroHealthMock(overrides?: Partial<NitroHealthMock>): NitroHealthMock
