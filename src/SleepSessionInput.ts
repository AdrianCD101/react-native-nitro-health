import type { SleepSessionStageInput } from './SleepSessionStageInput'

/** Sleep session written by {@linkcode NitroHealth.saveSleepSessions}. */
export interface SleepSessionInput {
  /** Start of the complete sleep session. */
  startDate: Date
  /** End of the complete sleep session. */
  endDate: Date
  /** Optional non-overlapping stage intervals contained within the session. */
  stages?: SleepSessionStageInput[]
  /** IANA time-zone identifier. Defaults to the device's current time zone. */
  timeZone?: string
}
