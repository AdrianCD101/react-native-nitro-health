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

/** Options for a mock with isolated in-memory sample storage. */
export interface NitroHealthMockOptions {
  profile?: NitroHealthMockProfile
  overrides?: NitroHealthMockOverrides
}

export const NitroHealth: NitroHealthMock
/** Creates an independent mock with empty sample storage. */
export function createNitroHealthMock(options?: NitroHealthMockOptions): NitroHealthMock
/** Replaces the exported mock's methods and clears its sample storage. */
export function resetNitroHealthMock(options?: NitroHealthMockOptions): NitroHealthMock
