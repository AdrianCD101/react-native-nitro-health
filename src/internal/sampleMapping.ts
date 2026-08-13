import type { ActiveEnergyBurnedSample } from '../ActiveEnergyBurnedSample'
import type { FloorsClimbedSample } from '../FloorsClimbedSample'
import type { FloorsClimbedSampleInput } from '../FloorsClimbedSampleInput'
import type { ActiveEnergyBurnedSampleInput } from '../ActiveEnergyBurnedSampleInput'
import type { BodyMassSample } from '../BodyMassSample'
import type { BodyMassSampleInput } from '../BodyMassSampleInput'
import type { DistanceSample } from '../DistanceSample'
import type { DistanceSampleInput } from '../DistanceSampleInput'
import type { DistanceWriteResult } from '../DistanceScope'
import type { HealthDataOrigin } from '../HealthDataOrigin'
import type { HealthMetricValue } from '../HealthMetricValue'
import type { HealthSamplePage } from '../HealthSamplePage'
import type { HealthChangesResult } from '../HealthChangesResult'
import type { HealthDataType, HealthStatisticsDataType } from '../HealthDataType'
import type { HealthRecordChange } from '../HealthRecordChange'
import type { HealthRecordSync } from '../HealthRecordSync'
import type { HealthSampleByDataType } from '../HealthSampleByDataType'
import type { HealthSampleIdentity, HealthRecordIdentity } from '../HealthSampleIdentity'
import type { HealthStatistics } from '../HealthStatistics'
import type { HealthStatisticsByDataType } from '../HealthStatisticsByDataType'
import type { HeartRateSample } from '../HeartRateSample'
import type { HeartRateSampleInput } from '../HeartRateSampleInput'
import type { HeartRateStatistics } from '../HeartRateStatistics'
import type { HeartRateVariabilitySample } from '../HeartRateVariabilitySample'
import type { HeightSample } from '../HeightSample'
import type { HeightSampleInput } from '../HeightSampleInput'
import type { HydrationSample } from '../HydrationSample'
import type { HydrationSampleInput } from '../HydrationSampleInput'
import type { Vo2MaxSample } from '../Vo2MaxSample'
import type { Vo2MaxSampleInput } from '../Vo2MaxSampleInput'
import type { NativeActiveEnergyBurnedSample } from '../NativeActiveEnergyBurnedSample'
import type { NativeFloorsClimbedSample } from '../NativeFloorsClimbedSample'
import type { NativeFloorsClimbedSampleInput } from '../NativeFloorsClimbedSampleInput'
import type { NativeActiveEnergyBurnedSampleInput } from '../NativeActiveEnergyBurnedSampleInput'
import type { NativeBodyMassSample } from '../NativeBodyMassSample'
import type { NativeBodyMassSampleInput } from '../NativeBodyMassSampleInput'
import type { NativeBodyTemperatureSample } from '../NativeBodyTemperatureSample'
import type { NativeBodyTemperatureSampleInput } from '../NativeBodyTemperatureSampleInput'
import type { NativeBasalBodyTemperatureSample } from '../NativeBasalBodyTemperatureSample'
import type { NativeBasalBodyTemperatureSampleInput } from '../NativeBasalBodyTemperatureSampleInput'
import type { NativeBodyFatSample } from '../NativeBodyFatSample'
import type { NativeBodyFatSampleInput } from '../NativeBodyFatSampleInput'
import type { NativeLeanBodyMassSample } from '../NativeLeanBodyMassSample'
import type { NativeLeanBodyMassSampleInput } from '../NativeLeanBodyMassSampleInput'
import type { NativeDistanceSample } from '../NativeDistanceSample'
import type { NativeBloodGlucoseSample } from '../NativeBloodGlucoseSample'
import type { NativeBloodGlucoseSampleInput } from '../NativeBloodGlucoseSampleInput'
import type { NativeBloodPressureSample } from '../NativeBloodPressureSample'
import type { NativeBloodPressureSampleInput } from '../NativeBloodPressureSampleInput'
import type { NativeDistanceSampleInput } from '../NativeDistanceSampleInput'
import type { NativeDistanceWriteResult } from '../NativeDistanceWriteResult'
import type { NativeHealthDataOrigin } from '../NativeHealthDataOrigin'
import type { NativeHealthMetricValue } from '../NativeHealthMetricValue'
import type { NativeHealthSampleIdentity } from '../NativeHealthSampleIdentity'
import type { NativeHealthStatistics } from '../NativeHealthStatistics'
import type { NativeHealthChange } from '../NativeHealthChange'
import type { NativeHealthChangesResult } from '../NativeHealthChangesResult'
import type { NativeHeartRateSample } from '../NativeHeartRateSample'
import type { NativeHeartRateSampleInput } from '../NativeHeartRateSampleInput'
import type { NativeHeartRateStatistics } from '../NativeHeartRateStatistics'
import type { NativeHeartRateVariabilitySample } from '../NativeHeartRateVariabilitySample'
import type { NativeHeightSample } from '../NativeHeightSample'
import type { NativeHeightSampleInput } from '../NativeHeightSampleInput'
import type { NativeHydrationSample } from '../NativeHydrationSample'
import type { NativeHydrationSampleInput } from '../NativeHydrationSampleInput'
import type { NativeVo2MaxSample } from '../NativeVo2MaxSample'
import type { NativeVo2MaxSampleInput } from '../NativeVo2MaxSampleInput'
import type { NativeOxygenSaturationSample } from '../NativeOxygenSaturationSample'
import type { NativeOxygenSaturationSampleInput } from '../NativeOxygenSaturationSampleInput'
import type { NativeRespiratoryRateSample } from '../NativeRespiratoryRateSample'
import type { NativeRespiratoryRateSampleInput } from '../NativeRespiratoryRateSampleInput'
import type { NativeRestingHeartRateSample } from '../NativeRestingHeartRateSample'
import type { NativeRestingHeartRateSampleInput } from '../NativeRestingHeartRateSampleInput'
import type { NativeSleepSessionInput } from '../NativeSleepSessionInput'
import type { NativeSleepSessionStageInput } from '../NativeSleepSessionStageInput'
import type { NativeSleepSample } from '../NativeSleepSample'
import type { NativeStepSample } from '../NativeStepSample'
import type { NativeStepSampleInput } from '../NativeStepSampleInput'
import type { NativeWorkoutSample } from '../NativeWorkoutSample'
import type { NativeWorkoutSampleInput } from '../NativeWorkoutSampleInput'
import type { NativeWorkoutActivity } from '../NativeWorkoutActivity'
import type { BloodGlucoseSample } from '../BloodGlucoseSample'
import type { BloodGlucoseSampleInput } from '../BloodGlucoseSampleInput'
import type { BloodPressureSample } from '../BloodPressureSample'
import type { BloodPressureSampleInput } from '../BloodPressureSampleInput'
import type {
  AndroidBloodPressureBodyPosition,
  AndroidBloodPressureMeasurementLocation,
} from '../BloodPressureMetadata'
import type { BodyTemperatureSample } from '../BodyTemperatureSample'
import type { BodyTemperatureSampleInput } from '../BodyTemperatureSampleInput'
import type { BasalBodyTemperatureSample } from '../BasalBodyTemperatureSample'
import type { BasalBodyTemperatureSampleInput } from '../BasalBodyTemperatureSampleInput'
import type { BodyFatSample } from '../BodyFatSample'
import type { BodyFatSampleInput } from '../BodyFatSampleInput'
import type { LeanBodyMassSample } from '../LeanBodyMassSample'
import type { LeanBodyMassSampleInput } from '../LeanBodyMassSampleInput'
import type { OxygenSaturationSample } from '../OxygenSaturationSample'
import type { OxygenSaturationSampleInput } from '../OxygenSaturationSampleInput'
import type { RespiratoryRateSample } from '../RespiratoryRateSample'
import type { RespiratoryRateSampleInput } from '../RespiratoryRateSampleInput'
import type { RestingHeartRateSample } from '../RestingHeartRateSample'
import type { RestingHeartRateSampleInput } from '../RestingHeartRateSampleInput'
import type { SleepSample } from '../SleepSample'
import type { SleepSessionInput } from '../SleepSessionInput'
import type { SleepStage } from '../SleepStage'
import type { WritableSleepStage } from '../SleepSessionStageInput'
import type { StepSample } from '../StepSample'
import type { StepSampleInput } from '../StepSampleInput'
import type { WorkoutSample } from '../WorkoutSample'
import type { WorkoutSampleInput } from '../WorkoutSampleInput'
import type { WorkoutActivity } from '../WorkoutActivity'
import type { WorkoutActivityType } from '../WorkoutActivityType'
import type { WritableWorkoutActivityType } from '../WritableWorkoutActivityType'
import {
  assertSampleBetween,
  assertSampleGreaterThanZero,
  assertSampleInterval,
  assertSampleMaxValue,
  assertSampleNonNegativeNumber,
  assertSamplePositiveInteger,
  assertStartBeforeEnd,
  dateToTimeMs,
  assertValidSampleDate,
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
const SLEEP_STAGES = new Set<SleepStage>([
  'inBed',
  'awake',
  'awakeInBed',
  'asleep',
  'asleepCore',
  'asleepDeep',
  'asleepREM',
  'outOfBed',
  'unknown',
])
const WORKOUT_ACTIVITY_TYPES = new Set<WorkoutActivityType>([
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

function makeNativeSync(
  sync: HealthRecordSync | undefined,
  indexOrPrefix: number | string
): { syncId?: string; syncVersion?: number } {
  if (sync === undefined) return {}

  const prefix = typeof indexOrPrefix === 'number' ? `samples[${indexOrPrefix}]` : indexOrPrefix

  if (typeof sync !== 'object' || sync === null) {
    throw new Error(`${prefix}: sync must contain an id and version`)
  }

  if (typeof sync.id !== 'string' || sync.id.trim() === '') {
    throw new Error(`${prefix}: sync.id must be a non-empty string`)
  }

  if (!Number.isSafeInteger(sync.version) || sync.version < 0) {
    throw new Error(`${prefix}: sync.version must be a non-negative safe integer`)
  }

  return { syncId: sync.id, syncVersion: sync.version }
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
    ...makeNativeSync(sample.sync, index),
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
    ...makeNativeSync(sample.sync, index),
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
    ...makeNativeSync(sample.sync, index),
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
    ...makeNativeSync(sample.sync, index),
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
    ...makeNativeSync(sample.sync, index),
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
    ...makeNativeSync(sample.sync, index),
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
    ...makeNativeSync(sample.sync, index),
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
    ...makeNativeSync(sample.sync, index),
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

  return {
    timeMs,
    systolicMmHg: sample.systolicMmHg,
    diastolicMmHg: sample.diastolicMmHg,
    ...makeNativeBloodPressureMetadata(sample.metadata, index),
    ...makeNativeSync(sample.sync, index),
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

  return {
    timeMs,
    millimolesPerLiter: sample.millimolesPerLiter,
    ...makeNativeSync(sample.sync, index),
  }
}

export function makeNativeBodyTemperatureSampleInput(
  sample: BodyTemperatureSampleInput,
  index: number
): NativeBodyTemperatureSampleInput {
  const timeMs = makeSampleInstant(sample, index)

  assertSampleBetween(sample.celsius, MIN_CELSIUS, MAX_CELSIUS, index, 'celsius')

  return {
    timeMs,
    celsius: sample.celsius,
    ...makeNativeSync(sample.sync, index),
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
    ...makeNativeSync(sample.sync, index),
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
    ...makeNativeSync(sample.sync, index),
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
    ...makeNativeSync(sample.sync, index),
  }
}

export function makeNativeBasalBodyTemperatureSampleInput(
  sample: BasalBodyTemperatureSampleInput,
  index: number
): NativeBasalBodyTemperatureSampleInput {
  const timeMs = makeSampleInstant(sample, index)

  assertSampleBetween(sample.celsius, MIN_CELSIUS, MAX_CELSIUS, index, 'celsius')

  return {
    timeMs,
    celsius: sample.celsius,
    ...makeNativeSync(sample.sync, index),
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
    ...makeNativeSync(sample.sync, index),
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
    ...makeNativeSync(sample.sync, index),
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

  return {
    timeMs,
    millilitersPerKilogramPerMinute: sample.millilitersPerKilogramPerMinute,
    ...makeNativeSync(sample.sync, index),
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
    ...makeNativeSync(workout.sync, 'workout'),
  }
}

export function makeSamplePage<TNative, TSample>(
  page: { samples: TNative[]; nextCursor?: string },
  map: (sample: TNative) => TSample
): HealthSamplePage<TSample> {
  return {
    samples: page.samples.map(map),
    ...(page.nextCursor === undefined ? {} : { nextCursor: page.nextCursor }),
  }
}

function makeDistanceScope(scope: NativeDistanceSample['scope']): DistanceSample['scope'] {
  if (scope === 'walkingRunning') return 'walking-running'
  if (scope === 'activityUnspecified') return 'activity-unspecified'
  throw new Error(`Unsupported native distance scope: ${scope}`)
}

function makeHealthDataOrigin(origin: NativeHealthDataOrigin): HealthDataOrigin {
  if (typeof origin.identifier !== 'string' || origin.identifier.trim() === '') {
    throw new Error('Native health sample has an invalid origin identifier')
  }

  return {
    identifier: origin.identifier,
    displayName: origin.displayName,
  }
}

function makeHealthSampleIdentity(identity: NativeHealthSampleIdentity): HealthSampleIdentity {
  if (typeof identity.id !== 'string' || identity.id.trim() === '') {
    throw new Error('Native health sample has an invalid identity id')
  }
  if (typeof identity.recordId !== 'string' || identity.recordId.trim() === '') {
    throw new Error('Native health sample has an invalid record id')
  }

  if (identity.kind === 'record') {
    if (identity.id !== identity.recordId) {
      throw new Error('Native record identity id does not match its record id')
    }
    return { kind: 'record', id: identity.id }
  }

  if (identity.kind === 'recordChild') {
    return {
      kind: 'record-child',
      id: identity.id,
      record: { kind: 'record', id: identity.recordId },
    }
  }

  throw new Error(`Unsupported native health identity kind: ${identity.kind}`)
}

function getRecordIdentity(identity: HealthSampleIdentity): HealthRecordIdentity {
  return identity.kind === 'record' ? identity : identity.record
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
  if (!WORKOUT_ACTIVITY_TYPES.has(activity.type as WorkoutActivityType)) {
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
    type: activity.type as WorkoutActivityType,
    portability: activity.portability === 'readOnly' ? 'read-only' : 'portable',
    mapping: activity.mapping,
  }
}

export function makeStepSample(sample: NativeStepSample): StepSample {
  return {
    identity: makeHealthSampleIdentity(sample.identity),
    origin: makeHealthDataOrigin(sample.origin),
    startDate: new Date(sample.startTimeMs),
    endDate: new Date(sample.endTimeMs),
    count: sample.count,
  }
}

export function makeDistanceSample(sample: NativeDistanceSample): DistanceSample {
  return {
    identity: makeHealthSampleIdentity(sample.identity),
    origin: makeHealthDataOrigin(sample.origin),
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
    identity: makeHealthSampleIdentity(sample.identity),
    origin: makeHealthDataOrigin(sample.origin),
    startDate: new Date(sample.startTimeMs),
    endDate: new Date(sample.endTimeMs),
    kilocalories: sample.kilocalories,
  }
}

export function makeHydrationSample(sample: NativeHydrationSample): HydrationSample {
  return {
    identity: makeHealthSampleIdentity(sample.identity),
    origin: makeHealthDataOrigin(sample.origin),
    startDate: new Date(sample.startTimeMs),
    endDate: new Date(sample.endTimeMs),
    milliliters: sample.milliliters,
  }
}

export function makeFloorsClimbedSample(sample: NativeFloorsClimbedSample): FloorsClimbedSample {
  return {
    identity: makeHealthSampleIdentity(sample.identity),
    origin: makeHealthDataOrigin(sample.origin),
    startDate: new Date(sample.startTimeMs),
    endDate: new Date(sample.endTimeMs),
    floors: sample.floors,
  }
}

export function makeBodyMassSample(sample: NativeBodyMassSample): BodyMassSample {
  return {
    identity: makeHealthSampleIdentity(sample.identity),
    origin: makeHealthDataOrigin(sample.origin),
    startDate: new Date(sample.startTimeMs),
    endDate: new Date(sample.endTimeMs),
    kilograms: sample.kilograms,
  }
}

export function makeHeartRateSample(sample: NativeHeartRateSample): HeartRateSample {
  return {
    identity: makeHealthSampleIdentity(sample.identity),
    origin: makeHealthDataOrigin(sample.origin),
    date: new Date(sample.timeMs),
    bpm: sample.bpm,
  }
}

export function makeRestingHeartRateSample(
  sample: NativeRestingHeartRateSample
): RestingHeartRateSample {
  return {
    identity: makeHealthSampleIdentity(sample.identity),
    origin: makeHealthDataOrigin(sample.origin),
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
    identity: makeHealthSampleIdentity(sample.identity),
    origin: makeHealthDataOrigin(sample.origin),
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

  return {
    identity: makeHealthSampleIdentity(sample.identity),
    origin: makeHealthDataOrigin(sample.origin),
    date: new Date(sample.timeMs),
    systolicMmHg: sample.systolicMmHg,
    diastolicMmHg: sample.diastolicMmHg,
    ...(metadata === undefined ? {} : { metadata }),
  }
}

export function makeBloodGlucoseSample(sample: NativeBloodGlucoseSample): BloodGlucoseSample {
  return {
    identity: makeHealthSampleIdentity(sample.identity),
    origin: makeHealthDataOrigin(sample.origin),
    date: new Date(sample.timeMs),
    millimolesPerLiter: sample.millimolesPerLiter,
  }
}

export function makeBodyTemperatureSample(
  sample: NativeBodyTemperatureSample
): BodyTemperatureSample {
  return {
    identity: makeHealthSampleIdentity(sample.identity),
    origin: makeHealthDataOrigin(sample.origin),
    date: new Date(sample.timeMs),
    celsius: sample.celsius,
  }
}

export function makeRespiratoryRateSample(
  sample: NativeRespiratoryRateSample
): RespiratoryRateSample {
  return {
    identity: makeHealthSampleIdentity(sample.identity),
    origin: makeHealthDataOrigin(sample.origin),
    date: new Date(sample.timeMs),
    breathsPerMinute: sample.breathsPerMinute,
  }
}

export function makeBodyFatSample(sample: NativeBodyFatSample): BodyFatSample {
  return {
    identity: makeHealthSampleIdentity(sample.identity),
    origin: makeHealthDataOrigin(sample.origin),
    date: new Date(sample.timeMs),
    percentage: sample.percentage,
  }
}

export function makeLeanBodyMassSample(sample: NativeLeanBodyMassSample): LeanBodyMassSample {
  return {
    identity: makeHealthSampleIdentity(sample.identity),
    origin: makeHealthDataOrigin(sample.origin),
    date: new Date(sample.timeMs),
    kilograms: sample.kilograms,
  }
}

export function makeBasalBodyTemperatureSample(
  sample: NativeBasalBodyTemperatureSample
): BasalBodyTemperatureSample {
  return {
    identity: makeHealthSampleIdentity(sample.identity),
    origin: makeHealthDataOrigin(sample.origin),
    date: new Date(sample.timeMs),
    celsius: sample.celsius,
  }
}

export function makeOxygenSaturationSample(
  sample: NativeOxygenSaturationSample
): OxygenSaturationSample {
  return {
    identity: makeHealthSampleIdentity(sample.identity),
    origin: makeHealthDataOrigin(sample.origin),
    date: new Date(sample.timeMs),
    percentage: sample.percentage,
  }
}

export function makeHeightSample(sample: NativeHeightSample): HeightSample {
  return {
    identity: makeHealthSampleIdentity(sample.identity),
    origin: makeHealthDataOrigin(sample.origin),
    date: new Date(sample.timeMs),
    meters: sample.meters,
  }
}

export function makeVo2MaxSample(sample: NativeVo2MaxSample): Vo2MaxSample {
  return {
    identity: makeHealthSampleIdentity(sample.identity),
    origin: makeHealthDataOrigin(sample.origin),
    date: new Date(sample.timeMs),
    millilitersPerKilogramPerMinute: sample.millilitersPerKilogramPerMinute,
  }
}

export function makeSleepSample(sample: NativeSleepSample): SleepSample {
  const identity = makeHealthSampleIdentity(sample.identity)
  const base = {
    identity,
    origin: makeHealthDataOrigin(sample.origin),
    startDate: new Date(sample.startTimeMs),
    endDate: new Date(sample.endTimeMs),
  }

  if (sample.kind === 'sessionEnvelope') {
    if (sample.stage !== undefined || sample.stageData === undefined) {
      throw new Error('Native sleep session envelope has invalid stage fields')
    }
    return {
      ...base,
      kind: 'session-envelope',
      stageData: sample.stageData === 'notReported' ? 'not-reported' : sample.stageData,
    }
  }

  if (sample.kind === 'stage') {
    if (sample.stage === undefined || sample.stageData !== undefined) {
      throw new Error('Native sleep stage has invalid stage fields')
    }
    if (!SLEEP_STAGES.has(sample.stage as SleepStage)) {
      throw new Error(`Unsupported native sleep stage: ${sample.stage}`)
    }
    return {
      ...base,
      kind: 'stage',
      stage: sample.stage as SleepStage,
    }
  }

  throw new Error(`Unsupported native sleep sample kind: ${sample.kind}`)
}

export function makeWorkoutSample(sample: NativeWorkoutSample): WorkoutSample {
  return {
    identity: makeHealthSampleIdentity(sample.identity),
    origin: makeHealthDataOrigin(sample.origin),
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

export function makeHeartRateStatistics(
  statistics: NativeHeartRateStatistics
): HeartRateStatistics {
  return {
    average: statistics.average,
    min: statistics.min,
    max: statistics.max,
  }
}

export function makeHealthStatistics<T extends HealthStatisticsDataType>(
  dataType: T,
  statistics: NativeHealthStatistics
): HealthStatisticsByDataType<T> {
  const result: HealthStatistics = {
    startDate: new Date(statistics.startTimeMs),
    endDate: new Date(statistics.endTimeMs),
    sum: statistics.sum,
    avg: statistics.avg,
    min: statistics.min,
    max: statistics.max,
  }

  if (dataType === 'distance') {
    if (statistics.scope === undefined) {
      throw new Error('Native distance statistics are missing scope')
    }
    return {
      ...result,
      scope: makeDistanceScope(statistics.scope),
    } as HealthStatisticsByDataType<T>
  }

  if (statistics.scope !== undefined) {
    throw new Error(`Native '${dataType}' statistics unexpectedly contain distance scope`)
  }
  return result as HealthStatisticsByDataType<T>
}

export function makeDistanceWriteResult(result: NativeDistanceWriteResult): DistanceWriteResult {
  return {
    status: 'completed',
    storedScope: makeDistanceScope(result.storedScope),
  }
}

const CHANGE_SAMPLE_FIELDS = [
  'stepSamples',
  'heartRateSamples',
  'bloodPressureSamples',
  'bloodGlucoseSamples',
  'bodyTemperatureSamples',
  'respiratoryRateSamples',
  'bodyFatSamples',
  'leanBodyMassSamples',
  'basalBodyTemperatureSamples',
  'restingHeartRateSamples',
  'heartRateVariabilitySamples',
  'distanceSamples',
  'activeEnergyBurnedSamples',
  'hydrationSamples',
  'floorsClimbedSamples',
  'oxygenSaturationSamples',
  'heightSamples',
  'vo2MaxSamples',
  'sleepSamples',
  'bodyMassSamples',
  'workoutSamples',
] as const

function assertNativeChangeIdentity(change: NativeHealthChange): void {
  if (typeof change.recordId !== 'string' || change.recordId.trim() === '') {
    throw new Error('Native health change has an invalid recordId')
  }
}

function makeUpsertSamples(
  dataType: HealthDataType,
  change: NativeHealthChange
): HealthRecordChange<HealthDataType> & { type: 'upsert' } {
  const populatedFields = CHANGE_SAMPLE_FIELDS.filter((field) => change[field] !== undefined)

  if (populatedFields.length !== 1) {
    throw new Error(`Native '${dataType}' upsert must contain exactly one sample payload`)
  }

  let samples: HealthSampleByDataType[HealthDataType][]
  switch (dataType) {
    case 'steps':
      if (change.stepSamples === undefined)
        throw new Error("Native 'steps' upsert is missing samples")
      samples = change.stepSamples.map(makeStepSample)
      break
    case 'heartRate':
      if (change.heartRateSamples === undefined)
        throw new Error("Native 'heartRate' upsert is missing samples")
      samples = change.heartRateSamples.map(makeHeartRateSample)
      break
    case 'bloodPressure':
      if (change.bloodPressureSamples === undefined)
        throw new Error("Native 'bloodPressure' upsert is missing samples")
      samples = change.bloodPressureSamples.map(makeBloodPressureSample)
      break
    case 'bloodGlucose':
      if (change.bloodGlucoseSamples === undefined)
        throw new Error("Native 'bloodGlucose' upsert is missing samples")
      samples = change.bloodGlucoseSamples.map(makeBloodGlucoseSample)
      break
    case 'bodyTemperature':
      if (change.bodyTemperatureSamples === undefined)
        throw new Error("Native 'bodyTemperature' upsert is missing samples")
      samples = change.bodyTemperatureSamples.map(makeBodyTemperatureSample)
      break
    case 'respiratoryRate':
      if (change.respiratoryRateSamples === undefined)
        throw new Error("Native 'respiratoryRate' upsert is missing samples")
      samples = change.respiratoryRateSamples.map(makeRespiratoryRateSample)
      break
    case 'bodyFat':
      if (change.bodyFatSamples === undefined)
        throw new Error("Native 'bodyFat' upsert is missing samples")
      samples = change.bodyFatSamples.map(makeBodyFatSample)
      break
    case 'leanBodyMass':
      if (change.leanBodyMassSamples === undefined)
        throw new Error("Native 'leanBodyMass' upsert is missing samples")
      samples = change.leanBodyMassSamples.map(makeLeanBodyMassSample)
      break
    case 'basalBodyTemperature':
      if (change.basalBodyTemperatureSamples === undefined)
        throw new Error("Native 'basalBodyTemperature' upsert is missing samples")
      samples = change.basalBodyTemperatureSamples.map(makeBasalBodyTemperatureSample)
      break
    case 'restingHeartRate':
      if (change.restingHeartRateSamples === undefined)
        throw new Error("Native 'restingHeartRate' upsert is missing samples")
      samples = change.restingHeartRateSamples.map(makeRestingHeartRateSample)
      break
    case 'heartRateVariability':
      if (change.heartRateVariabilitySamples === undefined)
        throw new Error("Native 'heartRateVariability' upsert is missing samples")
      samples = change.heartRateVariabilitySamples.map(makeHeartRateVariabilitySample)
      break
    case 'distance':
      if (change.distanceSamples === undefined)
        throw new Error("Native 'distance' upsert is missing samples")
      samples = change.distanceSamples.map(makeDistanceSample)
      break
    case 'activeEnergyBurned':
      if (change.activeEnergyBurnedSamples === undefined)
        throw new Error("Native 'activeEnergyBurned' upsert is missing samples")
      samples = change.activeEnergyBurnedSamples.map(makeActiveEnergyBurnedSample)
      break
    case 'hydration':
      if (change.hydrationSamples === undefined)
        throw new Error("Native 'hydration' upsert is missing samples")
      samples = change.hydrationSamples.map(makeHydrationSample)
      break
    case 'floorsClimbed':
      if (change.floorsClimbedSamples === undefined)
        throw new Error("Native 'floorsClimbed' upsert is missing samples")
      samples = change.floorsClimbedSamples.map(makeFloorsClimbedSample)
      break
    case 'oxygenSaturation':
      if (change.oxygenSaturationSamples === undefined)
        throw new Error("Native 'oxygenSaturation' upsert is missing samples")
      samples = change.oxygenSaturationSamples.map(makeOxygenSaturationSample)
      break
    case 'height':
      if (change.heightSamples === undefined)
        throw new Error("Native 'height' upsert is missing samples")
      samples = change.heightSamples.map(makeHeightSample)
      break
    case 'vo2Max':
      if (change.vo2MaxSamples === undefined)
        throw new Error("Native 'vo2Max' upsert is missing samples")
      samples = change.vo2MaxSamples.map(makeVo2MaxSample)
      break
    case 'sleep':
      if (change.sleepSamples === undefined)
        throw new Error("Native 'sleep' upsert is missing samples")
      samples = change.sleepSamples.map(makeSleepSample)
      break
    case 'bodyMass':
      if (change.bodyMassSamples === undefined)
        throw new Error("Native 'bodyMass' upsert is missing samples")
      samples = change.bodyMassSamples.map(makeBodyMassSample)
      break
    case 'workout':
      if (change.workoutSamples === undefined)
        throw new Error("Native 'workout' upsert is missing samples")
      samples = change.workoutSamples.map(makeWorkoutSample)
      break
  }

  if (samples.some((sample) => getRecordIdentity(sample.identity).id !== change.recordId)) {
    throw new Error(`Native '${dataType}' upsert samples do not match recordId`)
  }

  return {
    type: 'upsert',
    record: { kind: 'record', id: change.recordId },
    samples,
  }
}

function makeHealthRecordChange<T extends HealthDataType>(
  dataType: T,
  change: NativeHealthChange
): HealthRecordChange<T> {
  assertNativeChangeIdentity(change)

  if (change.type === 'delete') {
    if (CHANGE_SAMPLE_FIELDS.some((field) => change[field] !== undefined)) {
      throw new Error('Native delete change must not contain samples')
    }

    return {
      type: 'delete',
      record: { kind: 'record', id: change.recordId },
    }
  }

  if (change.type !== 'upsert') {
    throw new Error(`Unsupported native health change type: ${change.type}`)
  }

  return makeUpsertSamples(dataType, change) as HealthRecordChange<T>
}

export function makeHealthChangesResult<T extends HealthDataType>(
  dataType: T,
  result: NativeHealthChangesResult
): HealthChangesResult<T> {
  if (result.tokenExpired) {
    if (result.changes.length !== 0 || result.hasMore || result.nextChangesToken !== undefined) {
      throw new Error('Expired native changes result contains usable change data')
    }

    return { tokenExpired: true }
  }

  if (typeof result.nextChangesToken !== 'string' || result.nextChangesToken.trim() === '') {
    throw new Error('Native changes result is missing nextChangesToken')
  }

  return {
    tokenExpired: false,
    changes: result.changes.map((change) => makeHealthRecordChange(dataType, change)),
    nextChangesToken: result.nextChangesToken,
    hasMore: result.hasMore,
  }
}
