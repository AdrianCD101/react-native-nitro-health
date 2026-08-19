import type { NativeHealthWriteMetadata } from './NativeHealthWriteMetadata'
import type { NativeSleepSessionStageInput } from './NativeSleepSessionStageInput'

/** Native sleep session input using epoch-millisecond timestamps. */
export interface NativeSleepSessionInput {
  startTimeMs: number
  endTimeMs: number
  stages: NativeSleepSessionStageInput[]
  writeMetadata: NativeHealthWriteMetadata
}
