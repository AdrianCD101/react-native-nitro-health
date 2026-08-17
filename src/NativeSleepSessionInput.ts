import type { NativeHealthWriteProvenance } from './NativeHealthWriteProvenance'
import type { NativeSleepSessionStageInput } from './NativeSleepSessionStageInput'

/** Native sleep session input using epoch-millisecond timestamps. */
export interface NativeSleepSessionInput {
  startTimeMs: number
  endTimeMs: number
  stages: NativeSleepSessionStageInput[]
  timeZone?: string
  writeProvenance: NativeHealthWriteProvenance
}
