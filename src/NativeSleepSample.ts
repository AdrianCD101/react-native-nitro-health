import type { NativeHealthSampleMetadata } from './NativeHealthSampleMetadata'

export type NativeSleepSampleKind = 'sessionEnvelope' | 'stage'
export type NativeSleepStageData = 'reported' | 'notReported'

/** Native sleep interval shape returned through the Nitro spec. */
export interface NativeSleepSample {
  sampleMetadata: NativeHealthSampleMetadata
  kind: NativeSleepSampleKind
  startTimeMs: number
  endTimeMs: number
  stage?: string
  stageData?: NativeSleepStageData
}
