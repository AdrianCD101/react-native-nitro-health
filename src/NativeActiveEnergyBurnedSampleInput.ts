import type { NativeHealthDeviceInfo } from './NativeHealthDeviceInfo'
import type { NativeHealthRecordingMethod } from './NativeHealthRecordingMethod'

/** Native active energy sample input shape passed through the Nitro spec. */
export interface NativeActiveEnergyBurnedSampleInput {
  startTimeMs: number
  endTimeMs: number
  kilocalories: number
  device?: NativeHealthDeviceInfo
  recordingMethod?: NativeHealthRecordingMethod
  syncId?: string
  syncVersion?: number
}
