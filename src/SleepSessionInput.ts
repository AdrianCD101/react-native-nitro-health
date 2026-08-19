import type { HealthWriteMetadataInput } from './HealthWriteMetadataInput'
import type { SleepSessionMetadata } from './SleepSessionMetadata'
import type { SleepSessionStageInput } from './SleepSessionStageInput'

/** Sleep session written by {@linkcode NitroHealth.saveSleepSessions}. */
export interface SleepSessionInput extends HealthWriteMetadataInput {
  /** Start of the complete sleep session. */
  startDate: Date
  /** End of the complete sleep session. */
  endDate: Date
  /** Optional non-overlapping stage intervals contained within the session. */
  stages?: SleepSessionStageInput[]
  /** Platform-scoped session fields. */
  metadata?: SleepSessionMetadata
}
