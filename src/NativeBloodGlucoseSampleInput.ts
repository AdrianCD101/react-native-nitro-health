import type {
  NativeBloodGlucoseMealTime,
  NativeBloodGlucoseMealType,
  NativeBloodGlucoseRelationToMeal,
  NativeBloodGlucoseSpecimenSource,
} from './NativeBloodGlucoseMetadata'
import type { NativeHealthDeviceInfo } from './NativeHealthDeviceInfo'
import type { NativeHealthRecordingMethod } from './NativeHealthRecordingMethod'

/** Native blood glucose sample input shape passed through the Nitro spec. */
export interface NativeBloodGlucoseSampleInput {
  timeMs: number
  millimolesPerLiter: number
  device?: NativeHealthDeviceInfo
  recordingMethod?: NativeHealthRecordingMethod
  androidSpecimenSource?: NativeBloodGlucoseSpecimenSource
  androidMealType?: NativeBloodGlucoseMealType
  androidRelationToMeal?: NativeBloodGlucoseRelationToMeal
  iosMealTime?: NativeBloodGlucoseMealTime
  syncId?: string
  syncVersion?: number
}
