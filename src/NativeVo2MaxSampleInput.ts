import type {
  NativeAndroidVo2MaxMeasurementMethod,
  NativeIOSVo2MaxTestType,
} from './NativeVo2MaxMetadata'
import type { NativeHealthRecordingMethod } from './NativeHealthRecordingMethod'

/** Native VO2 max sample input shape passed through the Nitro spec. */
export interface NativeVo2MaxSampleInput {
  timeMs: number
  millilitersPerKilogramPerMinute: number
  recordingMethod?: NativeHealthRecordingMethod
  androidMeasurementMethod?: NativeAndroidVo2MaxMeasurementMethod
  iosTestType?: NativeIOSVo2MaxTestType
  syncId?: string
  syncVersion?: number
}
