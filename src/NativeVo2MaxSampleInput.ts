import type {
  NativeAndroidVo2MaxMeasurementMethod,
  NativeIOSVo2MaxTestType,
} from './NativeVo2MaxMetadata'
import type { NativeHealthWriteMetadata } from './NativeHealthWriteMetadata'

/** Native VO2 max sample input shape passed through the Nitro spec. */
export interface NativeVo2MaxSampleInput {
  timeMs: number
  millilitersPerKilogramPerMinute: number
  writeMetadata: NativeHealthWriteMetadata
  androidMeasurementMethod?: NativeAndroidVo2MaxMeasurementMethod
  iosTestType?: NativeIOSVo2MaxTestType
}
