/** Specimen source retained by {@linkcode AndroidBloodGlucoseMetadata.specimenSource}. */
export type AndroidBloodGlucoseSpecimenSource =
  | 'unknown'
  | 'interstitial_fluid'
  | 'capillary_blood'
  | 'plasma'
  | 'serum'
  | 'tears'
  | 'whole_blood'

/** Meal type retained by {@linkcode AndroidBloodGlucoseMetadata.mealType}. */
export type AndroidBloodGlucoseMealType = 'unknown' | 'breakfast' | 'lunch' | 'dinner' | 'snack'

/** Meal relationship retained by {@linkcode AndroidBloodGlucoseMetadata.relationToMeal}. */
export type AndroidBloodGlucoseRelationToMeal =
  | 'unknown'
  | 'general'
  | 'fasting'
  | 'before_meal'
  | 'after_meal'

/** Android-only fields accepted and returned through {@linkcode BloodGlucoseMetadata.android}. */
export interface AndroidBloodGlucoseMetadata {
  /** Body fluid used for the measurement. Omitted writes use `unknown`. */
  specimenSource?: AndroidBloodGlucoseSpecimenSource
  /** Meal associated with the measurement. Omitted writes use `unknown`. */
  mealType?: AndroidBloodGlucoseMealType
  /** Timing of the measurement relative to a meal. Omitted writes use `unknown`. */
  relationToMeal?: AndroidBloodGlucoseRelationToMeal
}

/** Meal timing retained by {@linkcode IOSBloodGlucoseMetadata.mealTime}. */
export type IOSBloodGlucoseMealTime = 'preprandial' | 'postprandial'

/** iOS-only fields accepted and returned through {@linkcode BloodGlucoseMetadata.ios}. */
export interface IOSBloodGlucoseMetadata {
  /** Timing stored under HealthKit's blood-glucose meal-time metadata key. */
  mealTime?: IOSBloodGlucoseMealTime
}

/** Platform-scoped metadata used by blood glucose read and write APIs. */
export interface BloodGlucoseMetadata {
  /** Health Connect blood glucose fields. */
  android?: AndroidBloodGlucoseMetadata
  /** HealthKit blood glucose fields. */
  ios?: IOSBloodGlucoseMetadata
}
