import type { HealthDeviceInfo } from './HealthDeviceInfo'
import type { HealthWriteProvenanceInput } from './HealthWriteProvenanceInput'
import type { SleepSessionStageInput } from './SleepSessionStageInput'

/** Sleep session written by {@linkcode NitroHealth.saveSleepSessions}. */
export interface SleepSessionInput extends HealthWriteProvenanceInput {
  /** Start of the complete sleep session. */
  startDate: Date
  /** End of the complete sleep session. */
  endDate: Date
  /** Optional non-overlapping stage intervals contained within the session. */
  stages?: SleepSessionStageInput[]
  /** Physical device asserted as having generated this session and its stages. */
  device?: HealthDeviceInfo
}
