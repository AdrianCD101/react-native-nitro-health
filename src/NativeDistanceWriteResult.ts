import type { NativeHealthRecordingMethod } from './NativeHealthRecordingMethod'

export type NativeDistanceScope = 'walkingRunning' | 'activityUnspecified'

/** Native result from writing walking/running distance. */
export interface NativeDistanceWriteResult {
  storedScope: NativeDistanceScope
  storedRecordingMethods: NativeHealthRecordingMethod[]
}
