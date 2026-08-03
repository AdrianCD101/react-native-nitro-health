/** Native sleep interval shape returned through the Nitro spec. */
export interface NativeSleepSample {
  /**
   * Stable sample identifier. HealthKit UUID on iOS; on Android, Health Connect
   * session record id plus a `#index` suffix for each stage within the session.
   */
  uuid: string
  /** Parent Health Connect session id on Android; equal to `uuid` on iOS. */
  recordUuid: string
  startTimeMs: number
  endTimeMs: number
  stage: string
  source?: string
}
