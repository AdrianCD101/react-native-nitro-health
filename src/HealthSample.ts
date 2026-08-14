import type { HealthDataOrigin } from './HealthDataOrigin'
import type { HealthRecordingMethod } from './HealthRecordingMethod'
import type { HealthSampleIdentity } from './HealthSampleIdentity'

/** Fields shared by every raw health sample. */
export interface HealthSample {
  /** Physical identity and deletion scope of this sample. */
  identity: HealthSampleIdentity
  /** Application that originally recorded this sample. */
  origin: HealthDataOrigin
  /** Method retained by the native health service for this sample. */
  recordingMethod: HealthRecordingMethod
}
