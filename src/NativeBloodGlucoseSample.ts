import type { NativeHealthDataOrigin } from './NativeHealthDataOrigin'
import type { NativeHealthRecordingMethod } from './NativeHealthRecordingMethod'
import type { NativeHealthSampleIdentity } from './NativeHealthSampleIdentity'
import type {
  NativeBloodGlucoseMealTime,
  NativeBloodGlucoseMealType,
  NativeBloodGlucoseRelationToMeal,
  NativeBloodGlucoseSpecimenSource,
} from './NativeBloodGlucoseMetadata'

/** Native blood glucose sample shape returned through the Nitro spec. */
export interface NativeBloodGlucoseSample {
  identity: NativeHealthSampleIdentity
  origin: NativeHealthDataOrigin
  recordingMethod: NativeHealthRecordingMethod
  timeMs: number
  millimolesPerLiter: number
  androidSpecimenSource?: NativeBloodGlucoseSpecimenSource
  androidMealType?: NativeBloodGlucoseMealType
  androidRelationToMeal?: NativeBloodGlucoseRelationToMeal
  iosMealTime?: NativeBloodGlucoseMealTime
}
