import type { HealthDeviceInfo } from './HealthDeviceInfo'
import type { HealthRecordSync } from './HealthRecordSync'
import type { HealthRecordingMethod } from './HealthRecordingMethod'

/** Distance sample accepted by {@linkcode NitroHealth.saveDistance}. */
export interface DistanceSampleInput {
  /** Declares that the supplied distance was measured while walking or running. */
  scope: 'walking-running'
  /** Sample start time. */
  startDate: Date
  /** Sample end time. */
  endDate: Date
  /** Distance covered during the sample range, in meters (0 to 1,000,000). */
  distanceMeters: number
  /** Physical device asserted as having generated this sample. */
  device?: HealthDeviceInfo
  /**
   * Requested recording method. On iOS, active and automatic recording degrade to `unknown`.
   * @default 'unknown'
   */
  recordingMethod?: HealthRecordingMethod
  /** Optional logical identity that makes retries idempotent and higher versions replace. */
  sync?: HealthRecordSync
}
