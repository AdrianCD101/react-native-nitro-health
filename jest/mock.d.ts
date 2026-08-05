import type { NitroHealth } from '../src'

type MockFunction<T extends (...args: any[]) => any> = T & {
  mockClear(): void
  mockReset(): void
  mockImplementation(implementation: T): unknown
  mockResolvedValue(value: Awaited<ReturnType<T>>): unknown
  mockReturnValue(value: ReturnType<T>): unknown
}

export type NitroHealthMock = {
  [K in keyof NitroHealth]: NitroHealth[K] extends (...args: any[]) => any
    ? MockFunction<NitroHealth[K]>
    : NitroHealth[K]
}

export type NitroHealthMockProfile = 'observer' | 'polling' | 'unavailable'
export type NitroHealthMockOverrides = Partial<NitroHealth>

export interface NitroHealthMockOptions {
  profile?: NitroHealthMockProfile
  overrides?: NitroHealthMockOverrides
}

export const NitroHealth: NitroHealthMock
export function createNitroHealthMock(options?: NitroHealthMockOptions): NitroHealthMock
export function resetNitroHealthMock(options?: NitroHealthMockOptions): NitroHealthMock
