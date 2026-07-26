import type { ActiveEnergyBurnedSample } from '../ActiveEnergyBurnedSample'
import type { ActiveEnergyBurnedSampleInput } from '../ActiveEnergyBurnedSampleInput'
import type { BodyMassSample } from '../BodyMassSample'
import type { BodyMassSampleInput } from '../BodyMassSampleInput'
import type { DailyActiveEnergyBurnedTotal } from '../DailyActiveEnergyBurnedTotal'
import type { DailyDistanceTotal } from '../DailyDistanceTotal'
import type { DailyStepTotal } from '../DailyStepTotal'
import type { DistanceSample } from '../DistanceSample'
import type { DistanceSampleInput } from '../DistanceSampleInput'
import type { HealthSamplePage } from '../HealthSamplePage'
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
import type { NativeDailyActiveEnergyBurnedTotal } from '../NativeDailyActiveEnergyBurnedTotal'
import type { NativeDailyDistanceTotal } from '../NativeDailyDistanceTotal'
import type { NativeDailyStepTotal } from '../NativeDailyStepTotal'
import type { NativeDistanceSample } from '../NativeDistanceSample'
import type { NativeDistanceSampleInput } from '../NativeDistanceSampleInput'
import type { NativeHealthStatistics } from '../NativeHealthStatistics'
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
import type { NativeSleepSample } from '../NativeSleepSample'
import type { NativeStepSample } from '../NativeStepSample'
import type { NativeStepSampleInput } from '../NativeStepSampleInput'
import type { NativeWorkoutSample } from '../NativeWorkoutSample'
import type { OxygenSaturationSample } from '../OxygenSaturationSample'
import type { OxygenSaturationSampleInput } from '../OxygenSaturationSampleInput'
import type { RestingHeartRateSample } from '../RestingHeartRateSample'
import type { RestingHeartRateSampleInput } from '../RestingHeartRateSampleInput'
import type { SleepSample } from '../SleepSample'
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
    startDate: new Date(sample.startTimeMs),
    endDate: new Date(sample.endTimeMs),
    count: sample.count,
  }
}

export function makeDailyStepTotal(total: NativeDailyStepTotal): DailyStepTotal {
  return {
    startDate: new Date(total.startTimeMs),
    endDate: new Date(total.endTimeMs),
    count: total.count,
  }
}

export function makeDistanceSample(sample: NativeDistanceSample): DistanceSample {
  return {
    uuid: sample.uuid,
    startDate: new Date(sample.startTimeMs),
    endDate: new Date(sample.endTimeMs),
    distanceMeters: sample.distanceMeters,
  }
}

export function makeDailyDistanceTotal(total: NativeDailyDistanceTotal): DailyDistanceTotal {
  return {
    startDate: new Date(total.startTimeMs),
    endDate: new Date(total.endTimeMs),
    distanceMeters: total.distanceMeters,
  }
}

export function makeActiveEnergyBurnedSample(
  sample: NativeActiveEnergyBurnedSample
): ActiveEnergyBurnedSample {
  return {
    uuid: sample.uuid,
    startDate: new Date(sample.startTimeMs),
    endDate: new Date(sample.endTimeMs),
    kilocalories: sample.kilocalories,
  }
}

export function makeDailyActiveEnergyBurnedTotal(
  total: NativeDailyActiveEnergyBurnedTotal
): DailyActiveEnergyBurnedTotal {
  return {
    startDate: new Date(total.startTimeMs),
    endDate: new Date(total.endTimeMs),
    kilocalories: total.kilocalories,
  }
}

export function makeBodyMassSample(sample: NativeBodyMassSample): BodyMassSample {
  return {
    uuid: sample.uuid,
    startDate: new Date(sample.startTimeMs),
    endDate: new Date(sample.endTimeMs),
    kilograms: sample.kilograms,
    source: sample.source,
  }
}

export function makeHeartRateSample(sample: NativeHeartRateSample): HeartRateSample {
  return {
    uuid: sample.uuid,
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
    date: new Date(sample.timeMs),
    percentage: sample.percentage,
    source: sample.source,
  }
}

export function makeHeightSample(sample: NativeHeightSample): HeightSample {
  return {
    uuid: sample.uuid,
    date: new Date(sample.timeMs),
    meters: sample.meters,
    source: sample.source,
  }
}

export function makeSleepSample(sample: NativeSleepSample): SleepSample {
  return {
    uuid: sample.uuid,
    startDate: new Date(sample.startTimeMs),
    endDate: new Date(sample.endTimeMs),
    stage: sample.stage as SleepSample['stage'],
    source: sample.source,
  }
}

export function makeWorkoutSample(sample: NativeWorkoutSample): WorkoutSample {
  return {
    uuid: sample.uuid,
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
