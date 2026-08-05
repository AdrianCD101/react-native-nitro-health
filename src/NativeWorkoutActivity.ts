export type NativeWorkoutActivityStatus = 'known' | 'unknown'
export type NativeWorkoutActivityPortability = 'portable' | 'readOnly'
export type NativeWorkoutActivityMapping = 'exact' | 'broadened'

/** Native transport for normalized workout activity semantics. */
export interface NativeWorkoutActivity {
  status: NativeWorkoutActivityStatus
  type?: string
  portability?: NativeWorkoutActivityPortability
  mapping?: NativeWorkoutActivityMapping
}
