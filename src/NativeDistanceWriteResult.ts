export type NativeDistanceScope = 'walkingRunning' | 'activityUnspecified'

/** Native result from writing walking/running distance. */
export interface NativeDistanceWriteResult {
  storedScope: NativeDistanceScope
}
