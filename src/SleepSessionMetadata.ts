/** Android-only fields accepted and returned through {@linkcode SleepSessionMetadata.android}. */
export interface AndroidSleepSessionMetadata {
  /** Session title shown by Health Connect apps. */
  title?: string
  /** Free-text notes attached to the session. */
  notes?: string
}

/** Platform-scoped metadata used by sleep session read and write APIs. */
export interface SleepSessionMetadata {
  /** Health Connect sleep session fields. HealthKit has no equivalent, so writes ignore this block on iOS. */
  android?: AndroidSleepSessionMetadata
}
