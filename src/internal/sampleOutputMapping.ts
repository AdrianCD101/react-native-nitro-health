import type { ActiveEnergyBurnedSample } from '../ActiveEnergyBurnedSample'
import type { BasalBodyTemperatureSample } from '../BasalBodyTemperatureSample'
import type { BloodGlucoseSample } from '../BloodGlucoseSample'
import type { BloodPressureSample } from '../BloodPressureSample'
import type {
  AndroidBloodPressureBodyPosition,
  AndroidBloodPressureMeasurementLocation,
} from '../BloodPressureMetadata'
import type { BodyFatSample } from '../BodyFatSample'
import type { BodyMassSample } from '../BodyMassSample'
import type { BodyTemperatureSample } from '../BodyTemperatureSample'
import type {
  AndroidBodyTemperatureMeasurementLocation,
  IOSBodyTemperatureSensorLocation,
} from '../BodyTemperatureMetadata'
import type { DistanceSample } from '../DistanceSample'
import type { DistanceWriteResult } from '../DistanceScope'
import type { FloorsClimbedSample } from '../FloorsClimbedSample'
import type { HealthMetricValue } from '../HealthMetricValue'
import type { HealthSamplePage } from '../HealthSamplePage'
import type { HealthWriteResult } from '../HealthWriteResult'
import type { HeartRateSample } from '../HeartRateSample'
import type { HeartRateVariabilitySample } from '../HeartRateVariabilitySample'
import type { HeightSample } from '../HeightSample'
import type { HydrationSample } from '../HydrationSample'
import type { LeanBodyMassSample } from '../LeanBodyMassSample'
import type { NativeActiveEnergyBurnedSample } from '../NativeActiveEnergyBurnedSample'
import type { NativeBasalBodyTemperatureSample } from '../NativeBasalBodyTemperatureSample'
import type { NativeBloodGlucoseSample } from '../NativeBloodGlucoseSample'
import type { NativeBloodPressureSample } from '../NativeBloodPressureSample'
import type { NativeBodyFatSample } from '../NativeBodyFatSample'
import type { NativeBodyMassSample } from '../NativeBodyMassSample'
import type { NativeBodyTemperatureSample } from '../NativeBodyTemperatureSample'
import type { NativeDistanceSample } from '../NativeDistanceSample'
import type { NativeDistanceWriteResult } from '../NativeDistanceWriteResult'
import type { NativeFloorsClimbedSample } from '../NativeFloorsClimbedSample'
import type { NativeHealthMetricValue } from '../NativeHealthMetricValue'
import type { NativeHealthWriteResult } from '../NativeHealthWriteResult'
import type { NativeHeartRateSample } from '../NativeHeartRateSample'
import type { NativeNutritionSample } from '../NativeNutritionSample'
import type { NutritionSample } from '../NutritionSample'
import type { NativeHeartRateVariabilitySample } from '../NativeHeartRateVariabilitySample'
import type { NativeHeightSample } from '../NativeHeightSample'
import type { NativeHydrationSample } from '../NativeHydrationSample'
import type { NativeLeanBodyMassSample } from '../NativeLeanBodyMassSample'
import type { NativeOxygenSaturationSample } from '../NativeOxygenSaturationSample'
import type { NativeRespiratoryRateSample } from '../NativeRespiratoryRateSample'
import type { NativeRestingHeartRateSample } from '../NativeRestingHeartRateSample'
import type { NativeSleepSample } from '../NativeSleepSample'
import type { NativeStepSample } from '../NativeStepSample'
import type { NativeVo2MaxSample } from '../NativeVo2MaxSample'
import type { NativeWorkoutActivity } from '../NativeWorkoutActivity'
import type { NativeWorkoutSample } from '../NativeWorkoutSample'
import type { OxygenSaturationSample } from '../OxygenSaturationSample'
import type { RespiratoryRateSample } from '../RespiratoryRateSample'
import type { RestingHeartRateSample } from '../RestingHeartRateSample'
import type { SleepSample, SleepSessionEnvelope } from '../SleepSample'
import type { AndroidSleepSessionMetadata } from '../SleepSessionMetadata'
import type { SleepStage } from '../SleepStage'
import type { StepSample } from '../StepSample'
import type { Vo2MaxSample } from '../Vo2MaxSample'
import type { WorkoutActivity } from '../WorkoutActivity'
import type { WorkoutActivityType } from '../WorkoutActivityType'
import type { WorkoutSample } from '../WorkoutSample'
import { makeHealthRecordingMethod, makeHealthSampleMetadata } from './sampleMetadataMapping'

const SLEEP_STAGES = new Set<string>([
  'awake',
  'awakeInBed',
  'asleep',
  'asleepCore',
  'asleepDeep',
  'asleepREM',
  'outOfBed',
  'unknown',
] satisfies SleepStage[])
const WORKOUT_ACTIVITY_TYPES = new Set<string>([
  'americanFootball',
  'archery',
  'australianFootball',
  'badminton',
  'barre',
  'baseball',
  'basketball',
  'bowling',
  'boxing',
  'calisthenics',
  'climbing',
  'coreTraining',
  'cricket',
  'crossTraining',
  'curling',
  'cycling',
  'dance',
  'discSports',
  'elliptical',
  'equestrianSports',
  'fencing',
  'fishing',
  'fitnessGaming',
  'flexibility',
  'golf',
  'gymnastics',
  'handball',
  'handCycling',
  'highIntensityIntervalTraining',
  'hiking',
  'hockey',
  'hunting',
  'jumpRope',
  'kickboxing',
  'lacrosse',
  'martialArts',
  'mindAndBody',
  'mixedCardio',
  'other',
  'paddleSports',
  'paragliding',
  'pickleball',
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
  'stepTraining',
  'strengthTraining',
  'surfing',
  'swimBikeRun',
  'swimming',
  'tableTennis',
  'taiChi',
  'tennis',
  'trackAndField',
  'underwaterDiving',
  'volleyball',
  'walking',
  'waterFitness',
  'waterPolo',
  'waterSports',
  'wheelchair',
  'wrestling',
  'yoga',
] satisfies WorkoutActivityType[])

function isSleepStage(value: string): value is SleepStage {
  return SLEEP_STAGES.has(value)
}

function isWorkoutActivityType(value: string): value is WorkoutActivityType {
  return WORKOUT_ACTIVITY_TYPES.has(value)
}

function makeBloodPressureBodyPosition(
  value: NonNullable<NativeBloodPressureSample['androidBodyPosition']>
): AndroidBloodPressureBodyPosition {
  switch (value) {
    case 'unspecified':
      return 'unknown'
    case 'standingUp':
      return 'standing_up'
    case 'sittingDown':
      return 'sitting_down'
    case 'lyingDown':
      return 'lying_down'
    case 'reclining':
      return 'reclining'
    default:
      throw new Error(`Unsupported native blood pressure body position: ${value}`)
  }
}

function makeBloodPressureMeasurementLocation(
  value: NonNullable<NativeBloodPressureSample['androidMeasurementLocation']>
): AndroidBloodPressureMeasurementLocation {
  switch (value) {
    case 'unspecified':
      return 'unknown'
    case 'leftWrist':
      return 'left_wrist'
    case 'rightWrist':
      return 'right_wrist'
    case 'leftUpperArm':
      return 'left_upper_arm'
    case 'rightUpperArm':
      return 'right_upper_arm'
    default:
      throw new Error(`Unsupported native blood pressure measurement location: ${value}`)
  }
}

function makeAndroidBodyTemperatureMeasurementLocation(
  value: NonNullable<NativeBodyTemperatureSample['androidMeasurementLocation']>
): AndroidBodyTemperatureMeasurementLocation {
  switch (value) {
    case 'unspecified':
      return 'unknown'
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
    case 'temporalArtery':
      return 'temporal_artery'
    default:
      throw new Error(`Unsupported native body temperature measurement location: ${value}`)
  }
}

function makeIOSBodyTemperatureSensorLocation(
  value: NonNullable<NativeBodyTemperatureSample['iosSensorLocation']>
): IOSBodyTemperatureSensorLocation {
  switch (value) {
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
    case 'gastroIntestinal':
      return 'gastro_intestinal'
    case 'earDrum':
      return 'ear_drum'
    case 'temporalArtery':
      return 'temporal_artery'
    default:
      throw new Error(`Unsupported native body temperature sensor location: ${value}`)
  }
}

function makeBodyTemperatureMetadata(
  sample: Pick<NativeBodyTemperatureSample, 'androidMeasurementLocation' | 'iosSensorLocation'>
): BodyTemperatureSample['metadata'] {
  let metadata: BodyTemperatureSample['metadata']
  if (sample.androidMeasurementLocation !== undefined) {
    metadata = {
      android: {
        measurementLocation: makeAndroidBodyTemperatureMeasurementLocation(
          sample.androidMeasurementLocation
        ),
      },
    }
  }
  if (sample.iosSensorLocation !== undefined) {
    metadata = {
      ...metadata,
      ios: { sensorLocation: makeIOSBodyTemperatureSensorLocation(sample.iosSensorLocation) },
    }
  }
  return metadata
}

export function makeSamplePage<TNative, TSample>(
  page: { samples: TNative[]; nextCursor?: string },
  map: (sample: TNative) => TSample
): HealthSamplePage<TSample> {
  const result: HealthSamplePage<TSample> = {
    samples: page.samples.map(map),
  }
  if (page.nextCursor !== undefined) result.nextCursor = page.nextCursor
  return result
}

export function makeDistanceScope(scope: NativeDistanceSample['scope']): DistanceSample['scope'] {
  if (scope === 'walkingRunning') return 'walking-running'
  if (scope === 'activityUnspecified') return 'activity-unspecified'
  throw new Error(`Unsupported native distance scope: ${scope}`)
}

function makeHealthMetricValue(metric: NativeHealthMetricValue): HealthMetricValue {
  if (metric.status === 'available') {
    if (typeof metric.value !== 'number' || !Number.isFinite(metric.value)) {
      throw new Error('Available native health metric is missing a finite value')
    }
    return { status: 'available', value: metric.value }
  }

  if (metric.value !== undefined) {
    throw new Error('Unavailable native health metric contains a value')
  }
  if (metric.status === 'notReported') return { status: 'not-reported' }
  if (metric.status === 'unsupported') return { status: 'unsupported' }
  throw new Error(`Unsupported native health metric status: ${metric.status}`)
}

function makeWorkoutActivity(activity: NativeWorkoutActivity): WorkoutActivity {
  if (activity.status === 'unknown') {
    if (
      activity.type !== undefined ||
      activity.portability !== undefined ||
      activity.mapping !== undefined
    ) {
      throw new Error('Unknown native workout activity contains known activity fields')
    }
    return { status: 'unknown' }
  }

  if (
    activity.status !== 'known' ||
    activity.type === undefined ||
    activity.portability === undefined ||
    activity.mapping === undefined
  ) {
    throw new Error('Known native workout activity is incomplete')
  }
  if (!isWorkoutActivityType(activity.type)) {
    throw new Error(`Unsupported normalized native workout activity: ${activity.type}`)
  }
  if (activity.portability !== 'portable' && activity.portability !== 'readOnly') {
    throw new Error(`Unsupported native workout portability: ${activity.portability}`)
  }
  if (activity.mapping !== 'exact' && activity.mapping !== 'broadened') {
    throw new Error(`Unsupported native workout mapping fidelity: ${activity.mapping}`)
  }

  return {
    status: 'known',
    type: activity.type,
    portability: activity.portability === 'readOnly' ? 'read-only' : 'portable',
    mapping: activity.mapping,
  }
}

export function makeStepSample(sample: NativeStepSample): StepSample {
  return {
    ...makeHealthSampleMetadata(sample.sampleMetadata),
    startDate: new Date(sample.startTimeMs),
    endDate: new Date(sample.endTimeMs),
    count: sample.count,
  }
}

export function makeDistanceSample(sample: NativeDistanceSample): DistanceSample {
  return {
    ...makeHealthSampleMetadata(sample.sampleMetadata),
    startDate: new Date(sample.startTimeMs),
    endDate: new Date(sample.endTimeMs),
    distanceMeters: sample.distanceMeters,
    scope: makeDistanceScope(sample.scope),
  }
}

export function makeActiveEnergyBurnedSample(
  sample: NativeActiveEnergyBurnedSample
): ActiveEnergyBurnedSample {
  return {
    ...makeHealthSampleMetadata(sample.sampleMetadata),
    startDate: new Date(sample.startTimeMs),
    endDate: new Date(sample.endTimeMs),
    kilocalories: sample.kilocalories,
  }
}

export function makeHydrationSample(sample: NativeHydrationSample): HydrationSample {
  return {
    ...makeHealthSampleMetadata(sample.sampleMetadata),
    startDate: new Date(sample.startTimeMs),
    endDate: new Date(sample.endTimeMs),
    milliliters: sample.milliliters,
  }
}

export function makeNutritionSample(sample: NativeNutritionSample): NutritionSample {
  const nutrition: NutritionSample = {
    ...makeHealthSampleMetadata(sample.sampleMetadata),
    startDate: new Date(sample.startTimeMs),
    endDate: new Date(sample.endTimeMs),
  }
  if (sample.foodName !== undefined) nutrition.foodName = sample.foodName
  if (sample.mealType !== undefined) nutrition.mealType = sample.mealType
  if (sample.energyKilocalories !== undefined)
    nutrition.energyKilocalories = sample.energyKilocalories
  if (sample.proteinGrams !== undefined) nutrition.proteinGrams = sample.proteinGrams
  if (sample.totalCarbohydrateGrams !== undefined)
    nutrition.totalCarbohydrateGrams = sample.totalCarbohydrateGrams
  if (sample.totalFatGrams !== undefined) nutrition.totalFatGrams = sample.totalFatGrams
  if (sample.dietaryFiberGrams !== undefined) nutrition.dietaryFiberGrams = sample.dietaryFiberGrams
  if (sample.sugarGrams !== undefined) nutrition.sugarGrams = sample.sugarGrams
  if (sample.sodiumMilligrams !== undefined) nutrition.sodiumMilligrams = sample.sodiumMilligrams

  return nutrition
}

export function makeFloorsClimbedSample(sample: NativeFloorsClimbedSample): FloorsClimbedSample {
  return {
    ...makeHealthSampleMetadata(sample.sampleMetadata),
    startDate: new Date(sample.startTimeMs),
    endDate: new Date(sample.endTimeMs),
    floors: sample.floors,
  }
}

export function makeBodyMassSample(sample: NativeBodyMassSample): BodyMassSample {
  return {
    ...makeHealthSampleMetadata(sample.sampleMetadata),
    startDate: new Date(sample.startTimeMs),
    endDate: new Date(sample.endTimeMs),
    kilograms: sample.kilograms,
  }
}

export function makeHeartRateSample(sample: NativeHeartRateSample): HeartRateSample {
  return {
    ...makeHealthSampleMetadata(sample.sampleMetadata),
    date: new Date(sample.timeMs),
    bpm: sample.bpm,
  }
}

export function makeRestingHeartRateSample(
  sample: NativeRestingHeartRateSample
): RestingHeartRateSample {
  return {
    ...makeHealthSampleMetadata(sample.sampleMetadata),
    date: new Date(sample.timeMs),
    bpm: sample.bpm,
  }
}

export function makeHeartRateVariabilitySample(
  sample: NativeHeartRateVariabilitySample
): HeartRateVariabilitySample {
  if (sample.method !== 'sdnn' && sample.method !== 'rmssd') {
    throw new Error(`Unsupported native heart rate variability method: ${sample.method}`)
  }
  return {
    ...makeHealthSampleMetadata(sample.sampleMetadata),
    date: new Date(sample.timeMs),
    milliseconds: sample.milliseconds,
    method: sample.method,
  }
}

export function makeBloodPressureSample(sample: NativeBloodPressureSample): BloodPressureSample {
  const hasBodyPosition = sample.androidBodyPosition !== undefined
  const hasMeasurementLocation = sample.androidMeasurementLocation !== undefined
  if (hasBodyPosition !== hasMeasurementLocation) {
    throw new Error('Native blood pressure metadata is incomplete')
  }

  let metadata: BloodPressureSample['metadata']
  if (sample.androidBodyPosition !== undefined && sample.androidMeasurementLocation !== undefined) {
    metadata = {
      android: {
        bodyPosition: makeBloodPressureBodyPosition(sample.androidBodyPosition),
        measurementLocation: makeBloodPressureMeasurementLocation(
          sample.androidMeasurementLocation
        ),
      },
    }
  }

  const result: BloodPressureSample = {
    ...makeHealthSampleMetadata(sample.sampleMetadata),
    date: new Date(sample.timeMs),
    systolicMmHg: sample.systolicMmHg,
    diastolicMmHg: sample.diastolicMmHg,
  }
  if (metadata !== undefined) result.metadata = metadata
  return result
}

export function makeBloodGlucoseSample(sample: NativeBloodGlucoseSample): BloodGlucoseSample {
  const androidFields = [
    sample.androidSpecimenSource,
    sample.androidMealType,
    sample.androidRelationToMeal,
  ]
  const androidFieldCount = androidFields.filter((field) => field !== undefined).length
  if (androidFieldCount !== 0 && androidFieldCount !== androidFields.length) {
    throw new Error('Native blood glucose Android metadata is incomplete')
  }

  let metadata: BloodGlucoseSample['metadata']
  if (
    sample.androidSpecimenSource !== undefined &&
    sample.androidMealType !== undefined &&
    sample.androidRelationToMeal !== undefined
  ) {
    const specimenSource = {
      unspecified: 'unknown',
      interstitialFluid: 'interstitial_fluid',
      capillaryBlood: 'capillary_blood',
      plasma: 'plasma',
      serum: 'serum',
      tears: 'tears',
      wholeBlood: 'whole_blood',
    } as const
    const mealType = {
      unspecified: 'unknown',
      breakfast: 'breakfast',
      lunch: 'lunch',
      dinner: 'dinner',
      snack: 'snack',
    } as const
    const relationToMeal = {
      unspecified: 'unknown',
      general: 'general',
      fasting: 'fasting',
      beforeMeal: 'before_meal',
      afterMeal: 'after_meal',
    } as const
    metadata = {
      android: {
        specimenSource: specimenSource[sample.androidSpecimenSource],
        mealType: mealType[sample.androidMealType],
        relationToMeal: relationToMeal[sample.androidRelationToMeal],
      },
    }
  }
  if (sample.iosMealTime !== undefined) {
    metadata = { ...metadata, ios: { mealTime: sample.iosMealTime } }
  }

  const result: BloodGlucoseSample = {
    ...makeHealthSampleMetadata(sample.sampleMetadata),
    date: new Date(sample.timeMs),
    millimolesPerLiter: sample.millimolesPerLiter,
  }
  if (metadata !== undefined) result.metadata = metadata
  return result
}

export function makeBodyTemperatureSample(
  sample: NativeBodyTemperatureSample
): BodyTemperatureSample {
  const metadata = makeBodyTemperatureMetadata(sample)
  const result: BodyTemperatureSample = {
    ...makeHealthSampleMetadata(sample.sampleMetadata),
    date: new Date(sample.timeMs),
    celsius: sample.celsius,
  }
  if (metadata !== undefined) result.metadata = metadata
  return result
}

export function makeRespiratoryRateSample(
  sample: NativeRespiratoryRateSample
): RespiratoryRateSample {
  return {
    ...makeHealthSampleMetadata(sample.sampleMetadata),
    date: new Date(sample.timeMs),
    breathsPerMinute: sample.breathsPerMinute,
  }
}

export function makeBodyFatSample(sample: NativeBodyFatSample): BodyFatSample {
  return {
    ...makeHealthSampleMetadata(sample.sampleMetadata),
    date: new Date(sample.timeMs),
    percentage: sample.percentage,
  }
}

export function makeLeanBodyMassSample(sample: NativeLeanBodyMassSample): LeanBodyMassSample {
  return {
    ...makeHealthSampleMetadata(sample.sampleMetadata),
    date: new Date(sample.timeMs),
    kilograms: sample.kilograms,
  }
}

export function makeBasalBodyTemperatureSample(
  sample: NativeBasalBodyTemperatureSample
): BasalBodyTemperatureSample {
  const metadata = makeBodyTemperatureMetadata(sample)
  const result: BasalBodyTemperatureSample = {
    ...makeHealthSampleMetadata(sample.sampleMetadata),
    date: new Date(sample.timeMs),
    celsius: sample.celsius,
  }
  if (metadata !== undefined) result.metadata = metadata
  return result
}

export function makeOxygenSaturationSample(
  sample: NativeOxygenSaturationSample
): OxygenSaturationSample {
  return {
    ...makeHealthSampleMetadata(sample.sampleMetadata),
    date: new Date(sample.timeMs),
    percentage: sample.percentage,
  }
}

export function makeHeightSample(sample: NativeHeightSample): HeightSample {
  return {
    ...makeHealthSampleMetadata(sample.sampleMetadata),
    date: new Date(sample.timeMs),
    meters: sample.meters,
  }
}

export function makeVo2MaxSample(sample: NativeVo2MaxSample): Vo2MaxSample {
  const androidMeasurementMethod = {
    other: 'other',
    metabolicCart: 'metabolic_cart',
    heartRateRatio: 'heart_rate_ratio',
    cooperTest: 'cooper_test',
    multistageFitnessTest: 'multistage_fitness_test',
    rockportFitnessTest: 'rockport_fitness_test',
  } as const
  const iosTestType = {
    maxExercise: 'max_exercise',
    predictionSubMaxExercise: 'prediction_sub_max_exercise',
    predictionNonExercise: 'prediction_non_exercise',
    predictionStepTest: 'prediction_step_test',
  } as const
  let metadata: Vo2MaxSample['metadata']
  if (sample.androidMeasurementMethod !== undefined) {
    metadata = {
      android: {
        measurementMethod: androidMeasurementMethod[sample.androidMeasurementMethod],
      },
    }
  }
  if (sample.iosTestType !== undefined) {
    metadata = { ...metadata, ios: { testType: iosTestType[sample.iosTestType] } }
  }

  const result: Vo2MaxSample = {
    ...makeHealthSampleMetadata(sample.sampleMetadata),
    date: new Date(sample.timeMs),
    millilitersPerKilogramPerMinute: sample.millilitersPerKilogramPerMinute,
  }
  if (metadata !== undefined) result.metadata = metadata
  return result
}

export function makeSleepSample(sample: NativeSleepSample): SleepSample {
  const base = {
    ...makeHealthSampleMetadata(sample.sampleMetadata),
    startDate: new Date(sample.startTimeMs),
    endDate: new Date(sample.endTimeMs),
  }

  if (sample.kind === 'sessionEnvelope') {
    if (sample.stage !== undefined || sample.stageData === undefined) {
      throw new Error('Native sleep session envelope has invalid stage fields')
    }
    let android: AndroidSleepSessionMetadata | undefined
    if (sample.androidTitle !== undefined) {
      android = { title: sample.androidTitle }
    }
    if (sample.androidNotes !== undefined) {
      android = { ...android, notes: sample.androidNotes }
    }
    const envelope: SleepSessionEnvelope = {
      ...base,
      kind: 'session-envelope',
      stageData: sample.stageData === 'notReported' ? 'not-reported' : sample.stageData,
    }
    if (android !== undefined) envelope.metadata = { android }
    return envelope
  }

  if (sample.kind === 'stage') {
    if (sample.stage === undefined || sample.stageData !== undefined) {
      throw new Error('Native sleep stage has invalid stage fields')
    }
    if (!isSleepStage(sample.stage)) {
      throw new Error(`Unsupported native sleep stage: ${sample.stage}`)
    }
    return {
      ...base,
      kind: 'stage',
      stage: sample.stage,
    }
  }

  throw new Error(`Unsupported native sleep sample kind: ${sample.kind}`)
}

export function makeWorkoutSample(sample: NativeWorkoutSample): WorkoutSample {
  return {
    ...makeHealthSampleMetadata(sample.sampleMetadata),
    startDate: new Date(sample.startTimeMs),
    endDate: new Date(sample.endTimeMs),
    elapsedDurationSeconds: sample.elapsedDurationSeconds,
    activeDuration: makeHealthMetricValue(sample.activeDuration),
    activity: makeWorkoutActivity(sample.activity),
    title: sample.title,
    brandName: sample.brandName,
    totalDistance: makeHealthMetricValue(sample.totalDistance),
    totalActiveEnergyBurned: makeHealthMetricValue(sample.totalActiveEnergyBurned),
  }
}

export function makeHealthWriteResult(
  result: NativeHealthWriteResult,
  expectedCount: number
): HealthWriteResult {
  if (result.storedRecordingMethods.length !== expectedCount) {
    throw new Error(
      `Native write returned ${result.storedRecordingMethods.length} recording methods for ${expectedCount} inputs`
    )
  }
  return {
    status: 'completed',
    storedRecordingMethods: result.storedRecordingMethods.map(makeHealthRecordingMethod),
  }
}

export function makeDistanceWriteResult(
  result: NativeDistanceWriteResult,
  expectedCount: number
): DistanceWriteResult {
  return {
    ...makeHealthWriteResult(result, expectedCount),
    storedScope: makeDistanceScope(result.storedScope),
  }
}
