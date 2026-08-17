import type {
  NativeBloodGlucoseMealTime,
  NativeBloodGlucoseMealType,
  NativeBloodGlucoseRelationToMeal,
  NativeBloodGlucoseSpecimenSource,
} from './NativeBloodGlucoseMetadata'
import type { NativeHealthWriteMetadata } from './NativeHealthWriteMetadata'

/** Native blood glucose sample input shape passed through the Nitro spec. */
export interface NativeBloodGlucoseSampleInput {
  timeMs: number
  millimolesPerLiter: number
  writeMetadata: NativeHealthWriteMetadata
  androidSpecimenSource?: NativeBloodGlucoseSpecimenSource
  androidMealType?: NativeBloodGlucoseMealType
  androidRelationToMeal?: NativeBloodGlucoseRelationToMeal
  iosMealTime?: NativeBloodGlucoseMealTime
}
