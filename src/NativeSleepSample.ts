import type { NativeHealthDataOrigin } from './NativeHealthDataOrigin'
import type { NativeHealthSampleIdentity } from './NativeHealthSampleIdentity'

export type NativeSleepSampleKind = 'sessionEnvelope' | 'stage'
export type NativeSleepStageData = 'reported' | 'notReported' | 'unverifiable'

/** Native sleep interval shape returned through the Nitro spec. */
export interface NativeSleepSample {
  identity: NativeHealthSampleIdentity
  origin: NativeHealthDataOrigin
  kind: NativeSleepSampleKind
  startTimeMs: number
  endTimeMs: number
  stage?: string
  stageData?: NativeSleepStageData
}
