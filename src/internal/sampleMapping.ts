import type { ActiveEnergyBurnedSample } from '../ActiveEnergyBurnedSample'
import type { ActiveEnergyBurnedSampleInput } from '../ActiveEnergyBurnedSampleInput'
import type { BodyMassSample } from '../BodyMassSample'
import type { BodyMassSampleInput } from '../BodyMassSampleInput'
import type { DistanceSample } from '../DistanceSample'
import type { DistanceSampleInput } from '../DistanceSampleInput'
import type { HealthSamplePage } from '../HealthSamplePage'
import type { HealthChangesResult } from '../HealthChangesResult'
import type { HealthDataType } from '../HealthDataType'
import type { HealthRecordChange } from '../HealthRecordChange'
import type { HealthRecordSync } from '../HealthRecordSync'
import type { HealthSampleByDataType } from '../HealthSampleByDataType'
import type { HealthStatistics } from '../HealthStatistics'
import type { HeartRateSample } from '../HeartRateSample'
import type { HeartRateSampleInput } from '../HeartRateSampleInput'
import type { HeartRateStatistics } from '../HeartRateStatistics'
import type { HeartRateVariabilitySample } from '../HeartRateVariabilitySample'
import type { HeightSample } from '../HeightSample'
import type { HeightSampleInput } from '../HeightSampleInput'
import type { NativeActiveEnergyBurnedSample } from '../NativeActiveEnergyBurnedSample'
import type { NativeActiveEnergyBurnedSampleInput } from '../NativeActiveEnergyBurnedSampleInput'
import type { NativeBodyMassSample } from '../NativeBodyMassSample'
import type { NativeBodyMassSampleInput } from '../NativeBodyMassSampleInput'
import type { NativeDistanceSample } from '../NativeDistanceSample'
import type { NativeDistanceSampleInput } from '../NativeDistanceSampleInput'
import type { NativeHealthStatistics } from '../NativeHealthStatistics'
import type { NativeHealthChange } from '../NativeHealthChange'
import type { NativeHealthChangesResult } from '../NativeHealthChangesResult'
import type { NativeHeartRateSample } from '../NativeHeartRateSample'
import type { NativeHeartRateSampleInput } from '../NativeHeartRateSampleInput'
import type { NativeHeartRateStatistics } from '../NativeHeartRateStatistics'
import type { NativeHeartRateVariabilitySample } from '../NativeHeartRateVariabilitySample'
import type { NativeHeightSample } from '../NativeHeightSample'
import type { NativeHeightSampleInput } from '../NativeHeightSampleInput'
import type { NativeOxygenSaturationSample } from '../NativeOxygenSaturationSample'
import type { NativeOxygenSaturationSampleInput } from '../NativeOxygenSaturationSampleInput'
import type { NativeRestingHeartRateSample } from '../NativeRestingHeartRateSample'
import type { NativeRestingHeartRateSampleInput } from '../NativeRestingHeartRateSampleInput'
import type { NativeSleepSessionInput } from '../NativeSleepSessionInput'
import type { NativeSleepSessionStageInput } from '../NativeSleepSessionStageInput'
import type { NativeSleepSample } from '../NativeSleepSample'
import type { NativeStepSample } from '../NativeStepSample'
import type { NativeStepSampleInput } from '../NativeStepSampleInput'
import type { NativeWorkoutSample } from '../NativeWorkoutSample'
import type { OxygenSaturationSample } from '../OxygenSaturationSample'
import type { OxygenSaturationSampleInput } from '../OxygenSaturationSampleInput'
import type { RestingHeartRateSample } from '../RestingHeartRateSample'
import type { RestingHeartRateSampleInput } from '../RestingHeartRateSampleInput'
import type { SleepSample } from '../SleepSample'
import type { SleepSessionInput } from '../SleepSessionInput'
import type { WritableSleepStage } from '../SleepSessionStageInput'
import type { StepSample } from '../StepSample'
import type { StepSampleInput } from '../StepSampleInput'
import type { WorkoutSample } from '../WorkoutSample'
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
const MIN_BPM = 1
const MAX_BPM = 300
const MAX_KILOGRAMS = 1_000
const MAX_HEIGHT_METERS = 3
const WRITABLE_SLEEP_STAGES = new Set<WritableSleepStage>([
  'awake',
  'asleep',
  'asleepCore',
  'asleepDeep',
  'asleepREM',
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
  index: number
): { syncId?: string; syncVersion?: number } {
  if (sync === undefined) return {}

  if (typeof sync !== 'object' || sync === null) {
    throw new Error(`samples[${index}]: sync must contain an id and version`)
  }

  if (typeof sync.id !== 'string' || sync.id.trim() === '') {
    throw new Error(`samples[${index}]: sync.id must be a non-empty string`)
  }

  if (!Number.isSafeInteger(sync.version) || sync.version < 0) {
    throw new Error(`samples[${index}]: sync.version must be a non-negative safe integer`)
  }

  return { syncId: sync.id, syncVersion: sync.version }
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
  const { startTimeMs, endTimeMs } = makeSampleInterval(sample, index)

  assertSampleNonNegativeNumber(sample.distanceMeters, index, 'distanceMeters')
  assertSampleMaxValue(sample.distanceMeters, MAX_DISTANCE_METERS, index, 'distanceMeters')

  return {
    startTimeMs,
    endTimeMs,
    distanceMeters: sample.distanceMeters,
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

export function makeSamplePage<TNative, TSample>(
  page: { samples: TNative[]; nextCursor?: string },
  map: (sample: TNative) => TSample
): HealthSamplePage<TSample> {
  return {
    samples: page.samples.map(map),
    nextCursor: page.nextCursor,
  }
}

export function makeStepSample(sample: NativeStepSample): StepSample {
  return {
    uuid: sample.uuid,
    recordUuid: sample.uuid,
    startDate: new Date(sample.startTimeMs),
    endDate: new Date(sample.endTimeMs),
    count: sample.count,
  }
}

export function makeDistanceSample(sample: NativeDistanceSample): DistanceSample {
  return {
    uuid: sample.uuid,
    recordUuid: sample.uuid,
    startDate: new Date(sample.startTimeMs),
    endDate: new Date(sample.endTimeMs),
    distanceMeters: sample.distanceMeters,
  }
}

export function makeActiveEnergyBurnedSample(
  sample: NativeActiveEnergyBurnedSample
): ActiveEnergyBurnedSample {
  return {
    uuid: sample.uuid,
    recordUuid: sample.uuid,
    startDate: new Date(sample.startTimeMs),
    endDate: new Date(sample.endTimeMs),
    kilocalories: sample.kilocalories,
  }
}

export function makeBodyMassSample(sample: NativeBodyMassSample): BodyMassSample {
  return {
    uuid: sample.uuid,
    recordUuid: sample.uuid,
    startDate: new Date(sample.startTimeMs),
    endDate: new Date(sample.endTimeMs),
    kilograms: sample.kilograms,
    source: sample.source,
  }
}

export function makeHeartRateSample(sample: NativeHeartRateSample): HeartRateSample {
  return {
    uuid: sample.uuid,
    recordUuid: sample.recordUuid,
    date: new Date(sample.timeMs),
    bpm: sample.bpm,
    source: sample.source,
  }
}

export function makeRestingHeartRateSample(
  sample: NativeRestingHeartRateSample
): RestingHeartRateSample {
  return {
    uuid: sample.uuid,
    recordUuid: sample.uuid,
    date: new Date(sample.timeMs),
    bpm: sample.bpm,
    source: sample.source,
  }
}

export function makeHeartRateVariabilitySample(
  sample: NativeHeartRateVariabilitySample
): HeartRateVariabilitySample {
  return {
    uuid: sample.uuid,
    recordUuid: sample.uuid,
    date: new Date(sample.timeMs),
    milliseconds: sample.milliseconds,
    method: sample.method as HeartRateVariabilitySample['method'],
    source: sample.source,
  }
}

export function makeOxygenSaturationSample(
  sample: NativeOxygenSaturationSample
): OxygenSaturationSample {
  return {
    uuid: sample.uuid,
    recordUuid: sample.uuid,
    date: new Date(sample.timeMs),
    percentage: sample.percentage,
    source: sample.source,
  }
}

export function makeHeightSample(sample: NativeHeightSample): HeightSample {
  return {
    uuid: sample.uuid,
    recordUuid: sample.uuid,
    date: new Date(sample.timeMs),
    meters: sample.meters,
    source: sample.source,
  }
}

export function makeSleepSample(sample: NativeSleepSample): SleepSample {
  return {
    uuid: sample.uuid,
    recordUuid: sample.recordUuid,
    startDate: new Date(sample.startTimeMs),
    endDate: new Date(sample.endTimeMs),
    stage: sample.stage as SleepSample['stage'],
    source: sample.source,
  }
}

export function makeWorkoutSample(sample: NativeWorkoutSample): WorkoutSample {
  return {
    uuid: sample.uuid,
    recordUuid: sample.uuid,
    startDate: new Date(sample.startTimeMs),
    endDate: new Date(sample.endTimeMs),
    durationSeconds: sample.durationSeconds,
    activityType: sample.activityType as WorkoutSample['activityType'],
    title: sample.title,
    source: sample.source,
    totalDistanceMeters: sample.totalDistanceMeters,
    totalEnergyBurnedKcal: sample.totalEnergyBurnedKcal,
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

export function makeHealthStatistics(statistics: NativeHealthStatistics): HealthStatistics {
  return {
    startDate: new Date(statistics.startTimeMs),
    endDate: new Date(statistics.endTimeMs),
    sum: statistics.sum,
    avg: statistics.avg,
    min: statistics.min,
    max: statistics.max,
  }
}

const CHANGE_SAMPLE_FIELDS = [
  'stepSamples',
  'heartRateSamples',
  'restingHeartRateSamples',
  'heartRateVariabilitySamples',
  'distanceSamples',
  'activeEnergyBurnedSamples',
  'oxygenSaturationSamples',
  'heightSamples',
  'sleepSamples',
  'bodyMassSamples',
  'workoutSamples',
] as const

function assertNativeChangeIdentity(change: NativeHealthChange): void {
  if (typeof change.recordUuid !== 'string' || change.recordUuid.trim() === '') {
    throw new Error('Native health change has an invalid recordUuid')
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

  if (samples.some((sample) => sample.recordUuid !== change.recordUuid)) {
    throw new Error(`Native '${dataType}' upsert samples do not match recordUuid`)
  }

  return {
    type: 'upsert',
    recordUuid: change.recordUuid,
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
      recordUuid: change.recordUuid,
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
