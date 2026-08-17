import type { ActiveEnergyBurnedSampleInput } from '../ActiveEnergyBurnedSampleInput'
import type { BasalBodyTemperatureSampleInput } from '../BasalBodyTemperatureSampleInput'
import type { BloodGlucoseSampleInput } from '../BloodGlucoseSampleInput'
import type {
  AndroidBloodGlucoseMealType,
  AndroidBloodGlucoseRelationToMeal,
  AndroidBloodGlucoseSpecimenSource,
  IOSBloodGlucoseMealTime,
} from '../BloodGlucoseMetadata'
import type { BloodPressureSampleInput } from '../BloodPressureSampleInput'
import type {
  AndroidBloodPressureBodyPosition,
  AndroidBloodPressureMeasurementLocation,
} from '../BloodPressureMetadata'
import type { BodyFatSampleInput } from '../BodyFatSampleInput'
import type { BodyMassSampleInput } from '../BodyMassSampleInput'
import type { BodyTemperatureSampleInput } from '../BodyTemperatureSampleInput'
import type {
  AndroidBodyTemperatureMeasurementLocation,
  IOSBodyTemperatureSensorLocation,
} from '../BodyTemperatureMetadata'
import type { DistanceSampleInput } from '../DistanceSampleInput'
import type { FloorsClimbedSampleInput } from '../FloorsClimbedSampleInput'
import type { HeartRateSampleInput } from '../HeartRateSampleInput'
import type { HeightSampleInput } from '../HeightSampleInput'
import type { HydrationSampleInput } from '../HydrationSampleInput'
import type { LeanBodyMassSampleInput } from '../LeanBodyMassSampleInput'
import type { NativeActiveEnergyBurnedSampleInput } from '../NativeActiveEnergyBurnedSampleInput'
import type { NativeBasalBodyTemperatureSampleInput } from '../NativeBasalBodyTemperatureSampleInput'
import type { NativeBloodGlucoseSampleInput } from '../NativeBloodGlucoseSampleInput'
import type { NativeBloodPressureSampleInput } from '../NativeBloodPressureSampleInput'
import type { NativeBodyFatSampleInput } from '../NativeBodyFatSampleInput'
import type { NativeBodyMassSampleInput } from '../NativeBodyMassSampleInput'
import type { NativeBodyTemperatureSampleInput } from '../NativeBodyTemperatureSampleInput'
import type { NativeDistanceSampleInput } from '../NativeDistanceSampleInput'
import type { NativeFloorsClimbedSampleInput } from '../NativeFloorsClimbedSampleInput'
import type { NativeHeartRateSampleInput } from '../NativeHeartRateSampleInput'
import type { NativeHeightSampleInput } from '../NativeHeightSampleInput'
import type { NativeHydrationSampleInput } from '../NativeHydrationSampleInput'
import type { NativeLeanBodyMassSampleInput } from '../NativeLeanBodyMassSampleInput'
import type { NativeOxygenSaturationSampleInput } from '../NativeOxygenSaturationSampleInput'
import type { NativeRespiratoryRateSampleInput } from '../NativeRespiratoryRateSampleInput'
import type { NativeRestingHeartRateSampleInput } from '../NativeRestingHeartRateSampleInput'
import type { NativeSleepSessionInput } from '../NativeSleepSessionInput'
import type { NativeSleepSessionStageInput } from '../NativeSleepSessionStageInput'
import type { NativeStepSampleInput } from '../NativeStepSampleInput'
import type { NativeVo2MaxSampleInput } from '../NativeVo2MaxSampleInput'
import type { NativeWorkoutSampleInput } from '../NativeWorkoutSampleInput'
import type { OxygenSaturationSampleInput } from '../OxygenSaturationSampleInput'
import type { RespiratoryRateSampleInput } from '../RespiratoryRateSampleInput'
import type { RestingHeartRateSampleInput } from '../RestingHeartRateSampleInput'
import type { SleepSessionInput } from '../SleepSessionInput'
import type { WritableSleepStage } from '../SleepSessionStageInput'
import type { StepSampleInput } from '../StepSampleInput'
import type { Vo2MaxSampleInput } from '../Vo2MaxSampleInput'
import type { AndroidVo2MaxMeasurementMethod, IOSVo2MaxTestType } from '../Vo2MaxMetadata'
import type { WorkoutSampleInput } from '../WorkoutSampleInput'
import type { WritableWorkoutActivityType } from '../WritableWorkoutActivityType'
import {
  makeNativeSync,
  makeNativeWriteMetadata,
  makeNativeWriteProvenance,
} from './sampleMetadataMapping'
import {
  assertSampleBetween,
  assertSampleGreaterThanZero,
  assertSampleInterval,
  assertSampleMaxValue,
  assertSampleNonNegativeNumber,
  assertSamplePositiveInteger,
  assertStartBeforeEnd,
  assertValidSampleDate,
  dateToTimeMs,
} from './validation'

// Upper bounds mirror Health Connect's record constraints (connect-client 1.1.0) so inputs
// behave identically on both platforms instead of passing on iOS and throwing a raw
// IllegalArgumentException on Android.
const MAX_STEP_COUNT = 1_000_000
const MAX_DISTANCE_METERS = 1_000_000
const MAX_KILOCALORIES = 1_000_000
const MAX_MILLILITERS = 100_000
const MAX_FLOORS = 1_000_000
const MIN_BPM = 1
const MAX_BPM = 300
const MIN_SYSTOLIC_MMHG = 20
const MAX_SYSTOLIC_MMHG = 200
const MIN_DIASTOLIC_MMHG = 10
const MAX_DIASTOLIC_MMHG = 180
const MIN_MILLIMOLES_PER_LITER = 0.5
const MAX_MILLIMOLES_PER_LITER = 50
const MIN_CELSIUS = 20
const MAX_CELSIUS = 45
const MIN_BREATHS_PER_MINUTE = 0
const MAX_BREATHS_PER_MINUTE = 120
const MAX_KILOGRAMS = 1_000
const MAX_HEIGHT_METERS = 3
const MIN_VO2_MAX = 0
const MAX_VO2_MAX = 100
const WRITABLE_SLEEP_STAGES = new Set<WritableSleepStage>([
  'awake',
  'asleep',
  'asleepCore',
  'asleepDeep',
  'asleepREM',
])
const WRITABLE_WORKOUT_ACTIVITY_TYPES = new Set<WritableWorkoutActivityType>([
  'americanFootball',
  'australianFootball',
  'badminton',
  'baseball',
  'basketball',
  'boxing',
  'climbing',
  'cricket',
  'crossTraining',
  'cycling',
  'dance',
  'discSports',
  'elliptical',
  'fencing',
  'flexibility',
  'golf',
  'gymnastics',
  'handball',
  'highIntensityIntervalTraining',
  'hiking',
  'hockey',
  'martialArts',
  'mindAndBody',
  'other',
  'paddleSports',
  'pilates',
  'racquetball',
  'rowing',
  'rugby',
  'running',
  'sailing',
  'skating',
  'skiing',
  'snowboarding',
  'snowSports',
  'soccer',
  'softball',
  'squash',
  'stairClimbing',
  'strengthTraining',
  'surfing',
  'swimming',
  'tableTennis',
  'tennis',
  'volleyball',
  'walking',
  'waterPolo',
  'wheelchair',
  'yoga',
])

function makeSampleInterval(
  sample: { startDate: Date; endDate: Date },
  index: number
): { startTimeMs: number; endTimeMs: number } {
  const startTimeMs = assertValidSampleDate(sample.startDate, index, 'startDate')
  const endTimeMs = assertValidSampleDate(sample.endDate, index, 'endDate')

  assertSampleInterval(startTimeMs, endTimeMs, index)

  return { startTimeMs, endTimeMs }
}

function makeSampleInstant(sample: { date: Date }, index: number): number {
  return assertValidSampleDate(sample.date, index, 'date')
}

function makeNativeBloodPressureBodyPosition(
  value: AndroidBloodPressureBodyPosition | undefined,
  index: number
): NativeBloodPressureSampleInput['androidBodyPosition'] {
  switch (value) {
    case undefined:
      return undefined
    case 'unknown':
      return 'unspecified'
    case 'standing_up':
      return 'standingUp'
    case 'sitting_down':
      return 'sittingDown'
    case 'lying_down':
      return 'lyingDown'
    case 'reclining':
      return 'reclining'
    default:
      throw new Error(`samples[${index}]: metadata.android.bodyPosition is unsupported`)
  }
}

function makeNativeBloodPressureMeasurementLocation(
  value: AndroidBloodPressureMeasurementLocation | undefined,
  index: number
): NativeBloodPressureSampleInput['androidMeasurementLocation'] {
  switch (value) {
    case undefined:
      return undefined
    case 'unknown':
      return 'unspecified'
    case 'left_wrist':
      return 'leftWrist'
    case 'right_wrist':
      return 'rightWrist'
    case 'left_upper_arm':
      return 'leftUpperArm'
    case 'right_upper_arm':
      return 'rightUpperArm'
    default:
      throw new Error(`samples[${index}]: metadata.android.measurementLocation is unsupported`)
  }
}

function makeNativeBloodPressureMetadata(
  metadata: BloodPressureSampleInput['metadata'],
  index: number
): Pick<NativeBloodPressureSampleInput, 'androidBodyPosition' | 'androidMeasurementLocation'> {
  if (metadata === undefined) return {}
  if (typeof metadata !== 'object' || metadata === null || Array.isArray(metadata)) {
    throw new Error(`samples[${index}]: metadata must be an object`)
  }
  const unsupportedPlatform = Object.keys(metadata).find((key) => key !== 'android')
  if (unsupportedPlatform !== undefined) {
    throw new Error(`samples[${index}]: metadata.${unsupportedPlatform} is unsupported`)
  }

  const android = metadata.android
  if (android === undefined) return {}
  if (typeof android !== 'object' || android === null || Array.isArray(android)) {
    throw new Error(`samples[${index}]: metadata.android must be an object`)
  }
  const supportedKeys = new Set(['bodyPosition', 'measurementLocation'])
  const unsupportedKey = Object.keys(android).find((key) => !supportedKeys.has(key))
  if (unsupportedKey !== undefined) {
    throw new Error(`samples[${index}]: metadata.android.${unsupportedKey} is unsupported`)
  }

  const androidBodyPosition = makeNativeBloodPressureBodyPosition(android.bodyPosition, index)
  const androidMeasurementLocation = makeNativeBloodPressureMeasurementLocation(
    android.measurementLocation,
    index
  )
  return {
    ...(androidBodyPosition === undefined ? {} : { androidBodyPosition }),
    ...(androidMeasurementLocation === undefined ? {} : { androidMeasurementLocation }),
  }
}

function makeNativeBloodGlucoseSpecimenSource(
  value: AndroidBloodGlucoseSpecimenSource | undefined,
  index: number
): NativeBloodGlucoseSampleInput['androidSpecimenSource'] {
  switch (value) {
    case undefined:
      return undefined
    case 'unknown':
      return 'unspecified'
    case 'interstitial_fluid':
      return 'interstitialFluid'
    case 'capillary_blood':
      return 'capillaryBlood'
    case 'plasma':
    case 'serum':
    case 'tears':
      return value
    case 'whole_blood':
      return 'wholeBlood'
    default:
      throw new Error(`samples[${index}]: metadata.android.specimenSource is unsupported`)
  }
}

function makeNativeBloodGlucoseMealType(
  value: AndroidBloodGlucoseMealType | undefined,
  index: number
): NativeBloodGlucoseSampleInput['androidMealType'] {
  switch (value) {
    case undefined:
      return undefined
    case 'unknown':
      return 'unspecified'
    case 'breakfast':
    case 'lunch':
    case 'dinner':
    case 'snack':
      return value
    default:
      throw new Error(`samples[${index}]: metadata.android.mealType is unsupported`)
  }
}

function makeNativeBloodGlucoseRelationToMeal(
  value: AndroidBloodGlucoseRelationToMeal | undefined,
  index: number
): NativeBloodGlucoseSampleInput['androidRelationToMeal'] {
  switch (value) {
    case undefined:
      return undefined
    case 'unknown':
      return 'unspecified'
    case 'general':
    case 'fasting':
      return value
    case 'before_meal':
      return 'beforeMeal'
    case 'after_meal':
      return 'afterMeal'
    default:
      throw new Error(`samples[${index}]: metadata.android.relationToMeal is unsupported`)
  }
}

function makeNativeBloodGlucoseMealTime(
  value: IOSBloodGlucoseMealTime | undefined,
  index: number
): NativeBloodGlucoseSampleInput['iosMealTime'] {
  switch (value) {
    case undefined:
      return undefined
    case 'preprandial':
    case 'postprandial':
      return value
    default:
      throw new Error(`samples[${index}]: metadata.ios.mealTime is unsupported`)
  }
}

function makeNativeBloodGlucoseMetadata(
  metadata: BloodGlucoseSampleInput['metadata'],
  index: number
): Partial<NativeBloodGlucoseSampleInput> {
  if (metadata === undefined) return {}
  if (typeof metadata !== 'object' || metadata === null || Array.isArray(metadata)) {
    throw new Error(`samples[${index}]: metadata must be an object`)
  }
  const supportedPlatforms = new Set(['android', 'ios'])
  const unsupportedPlatform = Object.keys(metadata).find((key) => !supportedPlatforms.has(key))
  if (unsupportedPlatform !== undefined) {
    throw new Error(`samples[${index}]: metadata.${unsupportedPlatform} is unsupported`)
  }

  const result: Partial<NativeBloodGlucoseSampleInput> = {}
  const android = metadata.android
  if (android !== undefined) {
    if (typeof android !== 'object' || android === null || Array.isArray(android)) {
      throw new Error(`samples[${index}]: metadata.android must be an object`)
    }
    const supportedKeys = new Set(['specimenSource', 'mealType', 'relationToMeal'])
    const unsupportedKey = Object.keys(android).find((key) => !supportedKeys.has(key))
    if (unsupportedKey !== undefined) {
      throw new Error(`samples[${index}]: metadata.android.${unsupportedKey} is unsupported`)
    }

    const androidSpecimenSource = makeNativeBloodGlucoseSpecimenSource(
      android.specimenSource,
      index
    )
    const androidMealType = makeNativeBloodGlucoseMealType(android.mealType, index)
    const androidRelationToMeal = makeNativeBloodGlucoseRelationToMeal(
      android.relationToMeal,
      index
    )
    if (androidSpecimenSource !== undefined) result.androidSpecimenSource = androidSpecimenSource
    if (androidMealType !== undefined) result.androidMealType = androidMealType
    if (androidRelationToMeal !== undefined) result.androidRelationToMeal = androidRelationToMeal
  }

  const ios = metadata.ios
  if (ios !== undefined) {
    if (typeof ios !== 'object' || ios === null || Array.isArray(ios)) {
      throw new Error(`samples[${index}]: metadata.ios must be an object`)
    }
    const unsupportedKey = Object.keys(ios).find((key) => key !== 'mealTime')
    if (unsupportedKey !== undefined) {
      throw new Error(`samples[${index}]: metadata.ios.${unsupportedKey} is unsupported`)
    }

    const iosMealTime = makeNativeBloodGlucoseMealTime(ios.mealTime, index)
    if (iosMealTime !== undefined) result.iosMealTime = iosMealTime
  }

  return result
}

function makeNativeAndroidVo2MaxMeasurementMethod(
  value: AndroidVo2MaxMeasurementMethod | undefined,
  index: number
): NativeVo2MaxSampleInput['androidMeasurementMethod'] {
  switch (value) {
    case undefined:
    case 'other':
      return value
    case 'metabolic_cart':
      return 'metabolicCart'
    case 'heart_rate_ratio':
      return 'heartRateRatio'
    case 'cooper_test':
      return 'cooperTest'
    case 'multistage_fitness_test':
      return 'multistageFitnessTest'
    case 'rockport_fitness_test':
      return 'rockportFitnessTest'
    default:
      throw new Error(`samples[${index}]: metadata.android.measurementMethod is unsupported`)
  }
}

function makeNativeIOSVo2MaxTestType(
  value: IOSVo2MaxTestType | undefined,
  index: number
): NativeVo2MaxSampleInput['iosTestType'] {
  switch (value) {
    case undefined:
      return undefined
    case 'max_exercise':
      return 'maxExercise'
    case 'prediction_sub_max_exercise':
      return 'predictionSubMaxExercise'
    case 'prediction_non_exercise':
      return 'predictionNonExercise'
    case 'prediction_step_test':
      return 'predictionStepTest'
    default:
      throw new Error(`samples[${index}]: metadata.ios.testType is unsupported`)
  }
}

function makeNativeVo2MaxMetadata(
  metadata: Vo2MaxSampleInput['metadata'],
  index: number
): Pick<NativeVo2MaxSampleInput, 'androidMeasurementMethod' | 'iosTestType'> {
  if (metadata === undefined) return {}
  if (typeof metadata !== 'object' || metadata === null || Array.isArray(metadata)) {
    throw new Error(`samples[${index}]: metadata must be an object`)
  }
  const supportedPlatforms = new Set(['android', 'ios'])
  const unsupportedPlatform = Object.keys(metadata).find((key) => !supportedPlatforms.has(key))
  if (unsupportedPlatform !== undefined) {
    throw new Error(`samples[${index}]: metadata.${unsupportedPlatform} is unsupported`)
  }

  const result: Pick<NativeVo2MaxSampleInput, 'androidMeasurementMethod' | 'iosTestType'> = {}
  const android = metadata.android
  if (android !== undefined) {
    if (typeof android !== 'object' || android === null || Array.isArray(android)) {
      throw new Error(`samples[${index}]: metadata.android must be an object`)
    }
    const unsupportedKey = Object.keys(android).find((key) => key !== 'measurementMethod')
    if (unsupportedKey !== undefined) {
      throw new Error(`samples[${index}]: metadata.android.${unsupportedKey} is unsupported`)
    }
    const androidMeasurementMethod = makeNativeAndroidVo2MaxMeasurementMethod(
      android.measurementMethod,
      index
    )
    if (androidMeasurementMethod !== undefined) {
      result.androidMeasurementMethod = androidMeasurementMethod
    }
  }

  const ios = metadata.ios
  if (ios !== undefined) {
    if (typeof ios !== 'object' || ios === null || Array.isArray(ios)) {
      throw new Error(`samples[${index}]: metadata.ios must be an object`)
    }
    const unsupportedKey = Object.keys(ios).find((key) => key !== 'testType')
    if (unsupportedKey !== undefined) {
      throw new Error(`samples[${index}]: metadata.ios.${unsupportedKey} is unsupported`)
    }
    const iosTestType = makeNativeIOSVo2MaxTestType(ios.testType, index)
    if (iosTestType !== undefined) result.iosTestType = iosTestType
  }

  return result
}

function makeNativeAndroidBodyTemperatureMeasurementLocation(
  value: AndroidBodyTemperatureMeasurementLocation | undefined,
  index: number
): NativeBodyTemperatureSampleInput['androidMeasurementLocation'] {
  switch (value) {
    case undefined:
      return undefined
    case 'unknown':
      return 'unspecified'
    case 'armpit':
    case 'finger':
    case 'forehead':
    case 'mouth':
    case 'rectum':
    case 'toe':
    case 'ear':
    case 'wrist':
    case 'vagina':
      return value
    case 'temporal_artery':
      return 'temporalArtery'
    default:
      throw new Error(`samples[${index}]: metadata.android.measurementLocation is unsupported`)
  }
}

function makeNativeIOSBodyTemperatureSensorLocation(
  value: IOSBodyTemperatureSensorLocation | undefined,
  index: number
): NativeBodyTemperatureSampleInput['iosSensorLocation'] {
  switch (value) {
    case undefined:
      return undefined
    case 'other':
    case 'armpit':
    case 'body':
    case 'ear':
    case 'finger':
    case 'mouth':
    case 'rectum':
    case 'toe':
    case 'forehead':
      return value
    case 'gastro_intestinal':
      return 'gastroIntestinal'
    case 'ear_drum':
      return 'earDrum'
    case 'temporal_artery':
      return 'temporalArtery'
    default:
      throw new Error(`samples[${index}]: metadata.ios.sensorLocation is unsupported`)
  }
}

function makeNativeBodyTemperatureMetadata(
  metadata: BodyTemperatureSampleInput['metadata'],
  index: number
): Pick<NativeBodyTemperatureSampleInput, 'androidMeasurementLocation' | 'iosSensorLocation'> {
  if (metadata === undefined) return {}
  if (typeof metadata !== 'object' || metadata === null || Array.isArray(metadata)) {
    throw new Error(`samples[${index}]: metadata must be an object`)
  }
  const supportedPlatforms = new Set(['android', 'ios'])
  const unsupportedPlatform = Object.keys(metadata).find((key) => !supportedPlatforms.has(key))
  if (unsupportedPlatform !== undefined) {
    throw new Error(`samples[${index}]: metadata.${unsupportedPlatform} is unsupported`)
  }

  const result: Pick<
    NativeBodyTemperatureSampleInput,
    'androidMeasurementLocation' | 'iosSensorLocation'
  > = {}
  const android = metadata.android
  if (android !== undefined) {
    if (typeof android !== 'object' || android === null || Array.isArray(android)) {
      throw new Error(`samples[${index}]: metadata.android must be an object`)
    }
    const unsupportedKey = Object.keys(android).find((key) => key !== 'measurementLocation')
    if (unsupportedKey !== undefined) {
      throw new Error(`samples[${index}]: metadata.android.${unsupportedKey} is unsupported`)
    }
    const androidMeasurementLocation = makeNativeAndroidBodyTemperatureMeasurementLocation(
      android.measurementLocation,
      index
    )
    if (androidMeasurementLocation !== undefined) {
      result.androidMeasurementLocation = androidMeasurementLocation
    }
  }

  const ios = metadata.ios
  if (ios !== undefined) {
    if (typeof ios !== 'object' || ios === null || Array.isArray(ios)) {
      throw new Error(`samples[${index}]: metadata.ios must be an object`)
    }
    const unsupportedKey = Object.keys(ios).find((key) => key !== 'sensorLocation')
    if (unsupportedKey !== undefined) {
      throw new Error(`samples[${index}]: metadata.ios.${unsupportedKey} is unsupported`)
    }
    const iosSensorLocation = makeNativeIOSBodyTemperatureSensorLocation(ios.sensorLocation, index)
    if (iosSensorLocation !== undefined) result.iosSensorLocation = iosSensorLocation
  }

  return result
}

export function makeNativeStepSampleInput(
  sample: StepSampleInput,
  index: number
): NativeStepSampleInput {
  const { startTimeMs, endTimeMs } = makeSampleInterval(sample, index)

  assertSamplePositiveInteger(sample.count, index, 'count')
  assertSampleMaxValue(sample.count, MAX_STEP_COUNT, index, 'count')

  return {
    startTimeMs,
    endTimeMs,
    count: sample.count,
    writeMetadata: makeNativeWriteMetadata(sample, index),
  }
}

export function makeNativeDistanceSampleInput(
  sample: DistanceSampleInput,
  index: number
): NativeDistanceSampleInput {
  if (sample.scope !== 'walking-running') {
    throw new Error(`samples[${index}]: scope must be walking-running`)
  }
  const { startTimeMs, endTimeMs } = makeSampleInterval(sample, index)

  assertSampleNonNegativeNumber(sample.distanceMeters, index, 'distanceMeters')
  assertSampleMaxValue(sample.distanceMeters, MAX_DISTANCE_METERS, index, 'distanceMeters')

  return {
    startTimeMs,
    endTimeMs,
    distanceMeters: sample.distanceMeters,
    scope: 'walkingRunning',
    writeMetadata: makeNativeWriteMetadata(sample, index),
  }
}

export function makeNativeActiveEnergyBurnedSampleInput(
  sample: ActiveEnergyBurnedSampleInput,
  index: number
): NativeActiveEnergyBurnedSampleInput {
  const { startTimeMs, endTimeMs } = makeSampleInterval(sample, index)

  assertSampleNonNegativeNumber(sample.kilocalories, index, 'kilocalories')
  assertSampleMaxValue(sample.kilocalories, MAX_KILOCALORIES, index, 'kilocalories')

  return {
    startTimeMs,
    endTimeMs,
    kilocalories: sample.kilocalories,
    writeMetadata: makeNativeWriteMetadata(sample, index),
  }
}

export function makeNativeHydrationSampleInput(
  sample: HydrationSampleInput,
  index: number
): NativeHydrationSampleInput {
  const { startTimeMs, endTimeMs } = makeSampleInterval(sample, index)

  assertSampleNonNegativeNumber(sample.milliliters, index, 'milliliters')
  assertSampleMaxValue(sample.milliliters, MAX_MILLILITERS, index, 'milliliters')

  return {
    startTimeMs,
    endTimeMs,
    milliliters: sample.milliliters,
    writeMetadata: makeNativeWriteMetadata(sample, index),
  }
}

export function makeNativeFloorsClimbedSampleInput(
  sample: FloorsClimbedSampleInput,
  index: number
): NativeFloorsClimbedSampleInput {
  const { startTimeMs, endTimeMs } = makeSampleInterval(sample, index)

  assertSampleNonNegativeNumber(sample.floors, index, 'floors')
  assertSampleMaxValue(sample.floors, MAX_FLOORS, index, 'floors')

  return {
    startTimeMs,
    endTimeMs,
    floors: sample.floors,
    writeMetadata: makeNativeWriteMetadata(sample, index),
  }
}

export function makeNativeHeartRateSampleInput(
  sample: HeartRateSampleInput,
  index: number
): NativeHeartRateSampleInput {
  const timeMs = makeSampleInstant(sample, index)

  assertSampleBetween(sample.bpm, MIN_BPM, MAX_BPM, index, 'bpm')

  return {
    timeMs,
    bpm: sample.bpm,
    writeMetadata: makeNativeWriteMetadata(sample, index),
  }
}

export function makeNativeBodyMassSampleInput(
  sample: BodyMassSampleInput,
  index: number
): NativeBodyMassSampleInput {
  const timeMs = makeSampleInstant(sample, index)

  assertSampleGreaterThanZero(sample.kilograms, index, 'kilograms')
  assertSampleMaxValue(sample.kilograms, MAX_KILOGRAMS, index, 'kilograms')

  return {
    timeMs,
    kilograms: sample.kilograms,
    writeMetadata: makeNativeWriteMetadata(sample, index),
  }
}

export function makeNativeRestingHeartRateSampleInput(
  sample: RestingHeartRateSampleInput,
  index: number
): NativeRestingHeartRateSampleInput {
  const timeMs = makeSampleInstant(sample, index)

  assertSampleBetween(sample.bpm, MIN_BPM, MAX_BPM, index, 'bpm')

  return {
    timeMs,
    bpm: sample.bpm,
    writeMetadata: makeNativeWriteMetadata(sample, index),
  }
}

export function makeNativeBloodPressureSampleInput(
  sample: BloodPressureSampleInput,
  index: number
): NativeBloodPressureSampleInput {
  const timeMs = makeSampleInstant(sample, index)

  assertSampleBetween(
    sample.systolicMmHg,
    MIN_SYSTOLIC_MMHG,
    MAX_SYSTOLIC_MMHG,
    index,
    'systolicMmHg'
  )
  assertSampleBetween(
    sample.diastolicMmHg,
    MIN_DIASTOLIC_MMHG,
    MAX_DIASTOLIC_MMHG,
    index,
    'diastolicMmHg'
  )

  const provenance = makeNativeWriteProvenance(sample, index)
  const metadata = makeNativeBloodPressureMetadata(sample.metadata, index)
  const sync = makeNativeSync(sample.sync, index)

  return {
    timeMs,
    systolicMmHg: sample.systolicMmHg,
    diastolicMmHg: sample.diastolicMmHg,
    writeMetadata: { provenance, ...(sync === undefined ? {} : { sync }) },
    ...metadata,
  }
}

export function makeNativeBloodGlucoseSampleInput(
  sample: BloodGlucoseSampleInput,
  index: number
): NativeBloodGlucoseSampleInput {
  const timeMs = makeSampleInstant(sample, index)

  assertSampleBetween(
    sample.millimolesPerLiter,
    MIN_MILLIMOLES_PER_LITER,
    MAX_MILLIMOLES_PER_LITER,
    index,
    'millimolesPerLiter'
  )

  const provenance = makeNativeWriteProvenance(sample, index)
  const metadata = makeNativeBloodGlucoseMetadata(sample.metadata, index)
  const sync = makeNativeSync(sample.sync, index)

  return {
    timeMs,
    millimolesPerLiter: sample.millimolesPerLiter,
    writeMetadata: { provenance, ...(sync === undefined ? {} : { sync }) },
    ...metadata,
  }
}

export function makeNativeBodyTemperatureSampleInput(
  sample: BodyTemperatureSampleInput,
  index: number
): NativeBodyTemperatureSampleInput {
  const timeMs = makeSampleInstant(sample, index)

  assertSampleBetween(sample.celsius, MIN_CELSIUS, MAX_CELSIUS, index, 'celsius')

  const provenance = makeNativeWriteProvenance(sample, index)
  const metadata = makeNativeBodyTemperatureMetadata(sample.metadata, index)
  const sync = makeNativeSync(sample.sync, index)

  return {
    timeMs,
    celsius: sample.celsius,
    writeMetadata: { provenance, ...(sync === undefined ? {} : { sync }) },
    ...metadata,
  }
}

export function makeNativeRespiratoryRateSampleInput(
  sample: RespiratoryRateSampleInput,
  index: number
): NativeRespiratoryRateSampleInput {
  const timeMs = makeSampleInstant(sample, index)

  assertSampleBetween(
    sample.breathsPerMinute,
    MIN_BREATHS_PER_MINUTE,
    MAX_BREATHS_PER_MINUTE,
    index,
    'breathsPerMinute'
  )

  return {
    timeMs,
    breathsPerMinute: sample.breathsPerMinute,
    writeMetadata: makeNativeWriteMetadata(sample, index),
  }
}

export function makeNativeBodyFatSampleInput(
  sample: BodyFatSampleInput,
  index: number
): NativeBodyFatSampleInput {
  const timeMs = makeSampleInstant(sample, index)

  assertSampleBetween(sample.percentage, 0, 100, index, 'percentage')

  return {
    timeMs,
    percentage: sample.percentage,
    writeMetadata: makeNativeWriteMetadata(sample, index),
  }
}

export function makeNativeLeanBodyMassSampleInput(
  sample: LeanBodyMassSampleInput,
  index: number
): NativeLeanBodyMassSampleInput {
  const timeMs = makeSampleInstant(sample, index)

  assertSampleGreaterThanZero(sample.kilograms, index, 'kilograms')
  assertSampleMaxValue(sample.kilograms, MAX_KILOGRAMS, index, 'kilograms')

  return {
    timeMs,
    kilograms: sample.kilograms,
    writeMetadata: makeNativeWriteMetadata(sample, index),
  }
}

export function makeNativeBasalBodyTemperatureSampleInput(
  sample: BasalBodyTemperatureSampleInput,
  index: number
): NativeBasalBodyTemperatureSampleInput {
  const timeMs = makeSampleInstant(sample, index)

  assertSampleBetween(sample.celsius, MIN_CELSIUS, MAX_CELSIUS, index, 'celsius')

  const provenance = makeNativeWriteProvenance(sample, index)
  const metadata = makeNativeBodyTemperatureMetadata(sample.metadata, index)
  const sync = makeNativeSync(sample.sync, index)

  return {
    timeMs,
    celsius: sample.celsius,
    writeMetadata: { provenance, ...(sync === undefined ? {} : { sync }) },
    ...metadata,
  }
}

export function makeNativeOxygenSaturationSampleInput(
  sample: OxygenSaturationSampleInput,
  index: number
): NativeOxygenSaturationSampleInput {
  const timeMs = makeSampleInstant(sample, index)

  assertSampleBetween(sample.percentage, 0, 100, index, 'percentage')

  return {
    timeMs,
    percentage: sample.percentage,
    writeMetadata: makeNativeWriteMetadata(sample, index),
  }
}

export function makeNativeHeightSampleInput(
  sample: HeightSampleInput,
  index: number
): NativeHeightSampleInput {
  const timeMs = makeSampleInstant(sample, index)

  assertSampleGreaterThanZero(sample.meters, index, 'meters')
  assertSampleMaxValue(sample.meters, MAX_HEIGHT_METERS, index, 'meters')

  return {
    timeMs,
    meters: sample.meters,
    writeMetadata: makeNativeWriteMetadata(sample, index),
  }
}

export function makeNativeVo2MaxSampleInput(
  sample: Vo2MaxSampleInput,
  index: number
): NativeVo2MaxSampleInput {
  const timeMs = makeSampleInstant(sample, index)

  assertSampleBetween(
    sample.millilitersPerKilogramPerMinute,
    MIN_VO2_MAX,
    MAX_VO2_MAX,
    index,
    'millilitersPerKilogramPerMinute'
  )

  const provenance = makeNativeWriteProvenance(sample, index)
  const metadata = makeNativeVo2MaxMetadata(sample.metadata, index)
  const sync = makeNativeSync(sample.sync, index)

  return {
    timeMs,
    millilitersPerKilogramPerMinute: sample.millilitersPerKilogramPerMinute,
    writeMetadata: { provenance, ...(sync === undefined ? {} : { sync }) },
    ...metadata,
  }
}

export function makeNativeSleepSessionInput(
  session: SleepSessionInput,
  sessionIndex: number
): NativeSleepSessionInput {
  const prefix = `sessions[${sessionIndex}]: `
  const startTimeMs = dateToTimeMs(session.startDate, `${prefix}a valid startDate is required`)
  const endTimeMs = dateToTimeMs(session.endDate, `${prefix}a valid endDate is required`)
  assertStartBeforeEnd(startTimeMs, endTimeMs, prefix)

  if (session.timeZone !== undefined) {
    if (typeof session.timeZone !== 'string' || session.timeZone.trim() === '') {
      throw new Error(`${prefix}timeZone must be a non-empty IANA time-zone identifier`)
    }
  }

  if (session.stages !== undefined && !Array.isArray(session.stages)) {
    throw new Error(`${prefix}stages must be an array when provided`)
  }

  const indexedStages = (session.stages ?? []).map((stage, stageIndex) => {
    const stagePrefix = `sessions[${sessionIndex}].stages[${stageIndex}]: `
    const stageStartTimeMs = dateToTimeMs(
      stage.startDate,
      `${stagePrefix}a valid startDate is required`
    )
    const stageEndTimeMs = dateToTimeMs(stage.endDate, `${stagePrefix}a valid endDate is required`)
    assertStartBeforeEnd(stageStartTimeMs, stageEndTimeMs, stagePrefix)

    if (stageStartTimeMs < startTimeMs || stageEndTimeMs > endTimeMs) {
      throw new Error(`${stagePrefix}interval must be contained within its sleep session`)
    }

    if (typeof stage.stage !== 'string' || !WRITABLE_SLEEP_STAGES.has(stage.stage)) {
      throw new Error(
        `${stagePrefix}stage must be awake, asleep, asleepCore, asleepDeep, or asleepREM`
      )
    }

    const nativeStage: NativeSleepSessionStageInput = {
      startTimeMs: stageStartTimeMs,
      endTimeMs: stageEndTimeMs,
      stage: stage.stage,
    }
    return { nativeStage, originalIndex: stageIndex }
  })

  indexedStages.sort((left, right) => {
    return (
      left.nativeStage.startTimeMs - right.nativeStage.startTimeMs ||
      left.nativeStage.endTimeMs - right.nativeStage.endTimeMs ||
      left.originalIndex - right.originalIndex
    )
  })

  for (let index = 1; index < indexedStages.length; index += 1) {
    const previous = indexedStages[index - 1]
    const current = indexedStages[index]
    if (previous === undefined || current === undefined) continue

    if (current.nativeStage.startTimeMs < previous.nativeStage.endTimeMs) {
      throw new Error(
        `sessions[${sessionIndex}].stages[${current.originalIndex}]: interval overlaps ` +
          `sessions[${sessionIndex}].stages[${previous.originalIndex}]`
      )
    }
  }

  return {
    startTimeMs,
    endTimeMs,
    stages: indexedStages.map(({ nativeStage }) => nativeStage),
    timeZone: session.timeZone,
    writeProvenance: makeNativeWriteProvenance(session, `sessions[${sessionIndex}]`),
  }
}

export function makeNativeWorkoutSampleInput(
  workout: WorkoutSampleInput
): NativeWorkoutSampleInput {
  const prefix = 'workout: '
  const startTimeMs = dateToTimeMs(workout.startDate, `${prefix}a valid startDate is required`)
  const endTimeMs = dateToTimeMs(workout.endDate, `${prefix}a valid endDate is required`)
  assertStartBeforeEnd(startTimeMs, endTimeMs, prefix)

  if (
    typeof workout.activityType !== 'string' ||
    !WRITABLE_WORKOUT_ACTIVITY_TYPES.has(workout.activityType)
  ) {
    throw new Error('workout: activityType is not supported for cross-platform writes')
  }

  if (workout.displayName !== undefined) {
    if (typeof workout.displayName !== 'string' || workout.displayName.trim() === '') {
      throw new Error('workout: displayName must be a non-empty string when provided')
    }
  }

  if (workout.timeZone !== undefined) {
    if (typeof workout.timeZone !== 'string' || workout.timeZone.trim() === '') {
      throw new Error('workout: timeZone must be a non-empty IANA time-zone identifier')
    }
  }

  return {
    startTimeMs,
    endTimeMs,
    activityType: workout.activityType,
    displayName: workout.displayName,
    timeZone: workout.timeZone,
    writeMetadata: makeNativeWriteMetadata(workout, 'workout'),
  }
}
