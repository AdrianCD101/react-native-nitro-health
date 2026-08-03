/** Native heart rate sample shape returned through the Nitro spec. */
export interface NativeHeartRateSample {
  /**
   * Stable sample identifier. HealthKit UUID on iOS; on Android, Health Connect
   * record id plus a `#index` suffix for each reading within the record.
   */
  uuid: string
  /** Parent Health Connect record id on Android; equal to `uuid` on iOS. */
  recordUuid: string
  timeMs: number
  bpm: number
  source?: string
}
