import type { NativeHealthSampleMetadata } from './NativeHealthSampleMetadata'
import type {
  NativeAndroidVo2MaxMeasurementMethod,
  NativeIOSVo2MaxTestType,
} from './NativeVo2MaxMetadata'

/** Native VO2 max sample shape returned through the Nitro spec. */
export interface NativeVo2MaxSample {
  sampleMetadata: NativeHealthSampleMetadata
  timeMs: number
  millilitersPerKilogramPerMinute: number
  androidMeasurementMethod?: NativeAndroidVo2MaxMeasurementMethod
  iosTestType?: NativeIOSVo2MaxTestType
}
