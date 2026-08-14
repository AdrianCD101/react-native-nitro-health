import type { NativeHealthDataOrigin } from './NativeHealthDataOrigin'
import type { NativeHealthSampleIdentity } from './NativeHealthSampleIdentity'
import type {
  NativeAndroidVo2MaxMeasurementMethod,
  NativeIOSVo2MaxTestType,
} from './NativeVo2MaxMetadata'

/** Native VO2 max sample shape returned through the Nitro spec. */
export interface NativeVo2MaxSample {
  identity: NativeHealthSampleIdentity
  origin: NativeHealthDataOrigin
  timeMs: number
  millilitersPerKilogramPerMinute: number
  androidMeasurementMethod?: NativeAndroidVo2MaxMeasurementMethod
  iosTestType?: NativeIOSVo2MaxTestType
}
