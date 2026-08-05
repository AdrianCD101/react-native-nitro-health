import type { NativeDistanceScope } from './NativeDistanceWriteResult'

/** Native distance sample input shape passed through the Nitro spec. */
export interface NativeDistanceSampleInput {
  startTimeMs: number
  endTimeMs: number
  distanceMeters: number
  scope: NativeDistanceScope
  syncId?: string
  syncVersion?: number
}
