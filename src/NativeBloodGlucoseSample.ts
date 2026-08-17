import type { NativeHealthSampleMetadata } from './NativeHealthSampleMetadata'
import type {
  NativeBloodGlucoseMealTime,
  NativeBloodGlucoseMealType,
  NativeBloodGlucoseRelationToMeal,
  NativeBloodGlucoseSpecimenSource,
} from './NativeBloodGlucoseMetadata'

/** Native blood glucose sample shape returned through the Nitro spec. */
export interface NativeBloodGlucoseSample {
  sampleMetadata: NativeHealthSampleMetadata
  timeMs: number
  millimolesPerLiter: number
  androidSpecimenSource?: NativeBloodGlucoseSpecimenSource
  androidMealType?: NativeBloodGlucoseMealType
  androidRelationToMeal?: NativeBloodGlucoseRelationToMeal
  iosMealTime?: NativeBloodGlucoseMealTime
}
