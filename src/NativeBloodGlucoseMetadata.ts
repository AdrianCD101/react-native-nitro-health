export type NativeBloodGlucoseSpecimenSource =
  | 'unspecified'
  | 'interstitialFluid'
  | 'capillaryBlood'
  | 'plasma'
  | 'serum'
  | 'tears'
  | 'wholeBlood'

export type NativeBloodGlucoseMealType =
  | 'unspecified'
  | 'breakfast'
  | 'lunch'
  | 'dinner'
  | 'snack'

export type NativeBloodGlucoseRelationToMeal =
  | 'unspecified'
  | 'general'
  | 'fasting'
  | 'beforeMeal'
  | 'afterMeal'

export type NativeBloodGlucoseMealTime = 'preprandial' | 'postprandial'
