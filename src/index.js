import { NitroModules } from 'react-native-nitro-modules'
const NitroHealthNative = NitroModules.createHybridObject('NitroHealth')
function assertPermissions(permissions) {
  if (permissions.length === 0) {
    throw new Error('At least one health permission is required')
  }
}
function assertValidDate(value, name) {
  if (!(value instanceof Date)) {
    throw new Error(`A valid ${name} is required`)
  }
  const timeMs = value.getTime()
  if (!Number.isFinite(timeMs)) {
    throw new Error(`A valid ${name} is required`)
  }
  return timeMs
}
function makeTimeRange(query) {
  const startTimeMs = assertValidDate(query.startDate, 'startDate')
  const endTimeMs = assertValidDate(query.endDate, 'endDate')
  if (startTimeMs >= endTimeMs) {
    throw new Error('startDate must be before endDate')
  }
  return {
    startTimeMs,
    endTimeMs,
  }
}
function makeNativeDateRangeQuery(query) {
  const { startTimeMs, endTimeMs } = makeTimeRange(query)
  const limit = query.limit ?? 1000
  if (!Number.isInteger(limit) || limit <= 0) {
    throw new Error('limit must be a positive integer')
  }
  return {
    startTimeMs,
    endTimeMs,
    limit,
    ascending: query.ascending ?? true,
  }
}
function makeNativeTimeRangeQuery(query) {
  const { startTimeMs, endTimeMs } = makeTimeRange(query)
  return {
    startTimeMs,
    endTimeMs,
  }
}
const STATISTICS_BUCKETS = ['hour', 'day', 'week', 'month']
const STATISTICS_METRICS_BY_DATA_TYPE = {
  steps: ['sum'],
  distance: ['sum'],
  activeEnergyBurned: ['sum'],
  heartRate: ['avg', 'min', 'max'],
  restingHeartRate: ['avg', 'min', 'max'],
  heartRateVariability: [],
  oxygenSaturation: [],
  height: ['avg', 'min', 'max'],
  bodyMass: ['avg', 'min', 'max'],
  sleep: [],
}
const STATISTICS_METRICS = Array.from(
  new Set(Object.values(STATISTICS_METRICS_BY_DATA_TYPE).flat())
)
function makeNativeStatisticsQuery(dataType, query) {
  const { startTimeMs, endTimeMs } = makeTimeRange(query)
  if (!STATISTICS_BUCKETS.includes(query.bucket)) {
    throw new Error('bucket must be one of: hour, day, week, month')
  }
  if (query.metrics.length === 0) {
    throw new Error('At least one metric is required')
  }
  const metrics = Array.from(new Set(query.metrics))
  for (const metric of metrics) {
    if (!STATISTICS_METRICS.includes(metric)) {
      throw new Error(`Unsupported statistics metric: ${metric}`)
    }
  }
  const supportedMetrics = STATISTICS_METRICS_BY_DATA_TYPE[dataType]
  if (supportedMetrics.length === 0) {
    throw new Error(`readStatistics does not support the '${dataType}' data type`)
  }
  for (const metric of metrics) {
    if (!supportedMetrics.includes(metric)) {
      throw new Error(
        `Metric '${metric}' is not supported for '${dataType}' (supported: ${supportedMetrics.join(', ')})`
      )
    }
  }
  return {
    startTimeMs,
    endTimeMs,
    bucket: query.bucket,
    metrics,
  }
}
function assertNonEmptySamples(samples) {
  if (samples.length === 0) {
    throw new Error('At least one sample is required')
  }
}
function assertValidSampleDate(value, index, name) {
  if (!(value instanceof Date)) {
    throw new Error(`samples[${index}]: a valid ${name} is required`)
  }
  const timeMs = value.getTime()
  if (!Number.isFinite(timeMs)) {
    throw new Error(`samples[${index}]: a valid ${name} is required`)
  }
  return timeMs
}
function assertSampleInterval(startTimeMs, endTimeMs, index) {
  if (startTimeMs >= endTimeMs) {
    throw new Error(`samples[${index}]: startDate must be before endDate`)
  }
}
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
function makeNativeStepSampleInput(sample, index) {
  const startTimeMs = assertValidSampleDate(sample.startDate, index, 'startDate')
  const endTimeMs = assertValidSampleDate(sample.endDate, index, 'endDate')
  assertSampleInterval(startTimeMs, endTimeMs, index)
  if (!Number.isInteger(sample.count) || sample.count <= 0) {
    throw new Error(`samples[${index}]: count must be a positive integer`)
  }
  if (sample.count > MAX_STEP_COUNT) {
    throw new Error(`samples[${index}]: count must not exceed ${MAX_STEP_COUNT}`)
  }
  return {
    startTimeMs,
    endTimeMs,
    count: sample.count,
  }
}
function makeNativeDistanceSampleInput(sample, index) {
  const startTimeMs = assertValidSampleDate(sample.startDate, index, 'startDate')
  const endTimeMs = assertValidSampleDate(sample.endDate, index, 'endDate')
  assertSampleInterval(startTimeMs, endTimeMs, index)
  if (!Number.isFinite(sample.distanceMeters) || sample.distanceMeters < 0) {
    throw new Error(`samples[${index}]: distanceMeters must be a non-negative number`)
  }
  if (sample.distanceMeters > MAX_DISTANCE_METERS) {
    throw new Error(`samples[${index}]: distanceMeters must not exceed ${MAX_DISTANCE_METERS}`)
  }
  return {
    startTimeMs,
    endTimeMs,
    distanceMeters: sample.distanceMeters,
  }
}
function makeNativeActiveEnergyBurnedSampleInput(sample, index) {
  const startTimeMs = assertValidSampleDate(sample.startDate, index, 'startDate')
  const endTimeMs = assertValidSampleDate(sample.endDate, index, 'endDate')
  assertSampleInterval(startTimeMs, endTimeMs, index)
  if (!Number.isFinite(sample.kilocalories) || sample.kilocalories < 0) {
    throw new Error(`samples[${index}]: kilocalories must be a non-negative number`)
  }
  if (sample.kilocalories > MAX_KILOCALORIES) {
    throw new Error(`samples[${index}]: kilocalories must not exceed ${MAX_KILOCALORIES}`)
  }
  return {
    startTimeMs,
    endTimeMs,
    kilocalories: sample.kilocalories,
  }
}
function makeNativeHeartRateSampleInput(sample, index) {
  const timeMs = assertValidSampleDate(sample.date, index, 'date')
  if (!Number.isFinite(sample.bpm) || sample.bpm < MIN_BPM || sample.bpm > MAX_BPM) {
    throw new Error(`samples[${index}]: bpm must be between ${MIN_BPM} and ${MAX_BPM}`)
  }
  return {
    timeMs,
    bpm: sample.bpm,
  }
}
function makeNativeBodyMassSampleInput(sample, index) {
  const timeMs = assertValidSampleDate(sample.date, index, 'date')
  if (!Number.isFinite(sample.kilograms) || sample.kilograms <= 0) {
    throw new Error(`samples[${index}]: kilograms must be greater than 0`)
  }
  if (sample.kilograms > MAX_KILOGRAMS) {
    throw new Error(`samples[${index}]: kilograms must not exceed ${MAX_KILOGRAMS}`)
  }
  return {
    timeMs,
    kilograms: sample.kilograms,
  }
}
function makeNativeRestingHeartRateSampleInput(sample, index) {
  const timeMs = assertValidSampleDate(sample.date, index, 'date')
  if (!Number.isFinite(sample.bpm) || sample.bpm < MIN_BPM || sample.bpm > MAX_BPM) {
    throw new Error(`samples[${index}]: bpm must be between ${MIN_BPM} and ${MAX_BPM}`)
  }
  return {
    timeMs,
    bpm: sample.bpm,
  }
}
function makeNativeOxygenSaturationSampleInput(sample, index) {
  const timeMs = assertValidSampleDate(sample.date, index, 'date')
  if (!Number.isFinite(sample.percentage) || sample.percentage < 0 || sample.percentage > 100) {
    throw new Error(`samples[${index}]: percentage must be between 0 and 100`)
  }
  return {
    timeMs,
    percentage: sample.percentage,
  }
}
function makeNativeHeightSampleInput(sample, index) {
  const timeMs = assertValidSampleDate(sample.date, index, 'date')
  if (!Number.isFinite(sample.meters) || sample.meters <= 0) {
    throw new Error(`samples[${index}]: meters must be greater than 0`)
  }
  if (sample.meters > MAX_HEIGHT_METERS) {
    throw new Error(`samples[${index}]: meters must not exceed ${MAX_HEIGHT_METERS}`)
  }
  return {
    timeMs,
    meters: sample.meters,
  }
}
function makeStepSample(sample) {
  return {
    startDate: new Date(sample.startTimeMs),
    endDate: new Date(sample.endTimeMs),
    count: sample.count,
  }
}
function makeDistanceSample(sample) {
  return {
    startDate: new Date(sample.startTimeMs),
    endDate: new Date(sample.endTimeMs),
    distanceMeters: sample.distanceMeters,
  }
}
function makeActiveEnergyBurnedSample(sample) {
  return {
    startDate: new Date(sample.startTimeMs),
    endDate: new Date(sample.endTimeMs),
    kilocalories: sample.kilocalories,
  }
}
function makeBodyMassSample(sample) {
  return {
    startDate: new Date(sample.startTimeMs),
    endDate: new Date(sample.endTimeMs),
    kilograms: sample.kilograms,
    source: sample.source,
  }
}
function makeHeartRateSample(sample) {
  return {
    date: new Date(sample.timeMs),
    bpm: sample.bpm,
    source: sample.source,
  }
}
function makeRestingHeartRateSample(sample) {
  return {
    date: new Date(sample.timeMs),
    bpm: sample.bpm,
    source: sample.source,
  }
}
function makeHeartRateVariabilitySample(sample) {
  return {
    date: new Date(sample.timeMs),
    milliseconds: sample.milliseconds,
    method: sample.method,
    source: sample.source,
  }
}
function makeOxygenSaturationSample(sample) {
  return {
    date: new Date(sample.timeMs),
    percentage: sample.percentage,
    source: sample.source,
  }
}
function makeHeightSample(sample) {
  return {
    date: new Date(sample.timeMs),
    meters: sample.meters,
    source: sample.source,
  }
}
function makeSleepSample(sample) {
  return {
    startDate: new Date(sample.startTimeMs),
    endDate: new Date(sample.endTimeMs),
    stage: sample.stage,
    source: sample.source,
  }
}
function makeHeartRateStatistics(statistics) {
  return {
    average: statistics.average,
    min: statistics.min,
    max: statistics.max,
  }
}
function makeHealthStatistics(statistics) {
  return {
    startDate: new Date(statistics.startTimeMs),
    endDate: new Date(statistics.endTimeMs),
    sum: statistics.sum,
    avg: statistics.avg,
    min: statistics.min,
    max: statistics.max,
  }
}
export const NitroHealth = {
  get name() {
    return NitroHealthNative.name
  },
  toString() {
    return NitroHealthNative.toString()
  },
  equals(other) {
    return NitroHealthNative.equals(other)
  },
  dispose() {
    NitroHealthNative.dispose()
  },
  isAvailable() {
    return NitroHealthNative.isAvailable()
  },
  getAvailabilityStatus() {
    return NitroHealthNative.getAvailabilityStatus()
  },
  openHealthConnectInstall() {
    return NitroHealthNative.openHealthConnectInstall()
  },
  openHealthSettings() {
    return NitroHealthNative.openHealthSettings()
  },
  async readSteps(query) {
    const samples = await NitroHealthNative.readSteps(makeNativeDateRangeQuery(query))
    return samples.map(makeStepSample)
  },
  async readDailyStepTotals(query) {
    const samples = await NitroHealthNative.readDailyStepTotals(makeNativeDateRangeQuery(query))
    return samples.map(makeStepSample)
  },
  async readDistance(query) {
    const samples = await NitroHealthNative.readDistance(makeNativeDateRangeQuery(query))
    return samples.map(makeDistanceSample)
  },
  async readDailyDistanceTotals(query) {
    const samples = await NitroHealthNative.readDailyDistanceTotals(makeNativeDateRangeQuery(query))
    return samples.map(makeDistanceSample)
  },
  async readActiveEnergyBurned(query) {
    const samples = await NitroHealthNative.readActiveEnergyBurned(makeNativeDateRangeQuery(query))
    return samples.map(makeActiveEnergyBurnedSample)
  },
  async readDailyActiveEnergyBurnedTotals(query) {
    const samples = await NitroHealthNative.readDailyActiveEnergyBurnedTotals(
      makeNativeDateRangeQuery(query)
    )
    return samples.map(makeActiveEnergyBurnedSample)
  },
  async readBodyMass(query) {
    const samples = await NitroHealthNative.readBodyMass(makeNativeDateRangeQuery(query))
    return samples.map(makeBodyMassSample)
  },
  async readHeartRate(query) {
    const samples = await NitroHealthNative.readHeartRate(makeNativeDateRangeQuery(query))
    return samples.map(makeHeartRateSample)
  },
  async readHeartRateStatistics(query) {
    const statistics = await NitroHealthNative.readHeartRateStatistics(
      makeNativeTimeRangeQuery(query)
    )
    return makeHeartRateStatistics(statistics)
  },
  async readRestingHeartRate(query) {
    const samples = await NitroHealthNative.readRestingHeartRate(makeNativeDateRangeQuery(query))
    return samples.map(makeRestingHeartRateSample)
  },
  async readHeartRateVariability(query) {
    const samples = await NitroHealthNative.readHeartRateVariability(
      makeNativeDateRangeQuery(query)
    )
    return samples.map(makeHeartRateVariabilitySample)
  },
  async readOxygenSaturation(query) {
    const samples = await NitroHealthNative.readOxygenSaturation(makeNativeDateRangeQuery(query))
    return samples.map(makeOxygenSaturationSample)
  },
  async readHeight(query) {
    const samples = await NitroHealthNative.readHeight(makeNativeDateRangeQuery(query))
    return samples.map(makeHeightSample)
  },
  async readStatistics(dataType, query) {
    const statistics = await NitroHealthNative.readStatistics(
      dataType,
      makeNativeStatisticsQuery(dataType, query)
    )
    return statistics.map(makeHealthStatistics)
  },
  async readSleepSamples(query) {
    const samples = await NitroHealthNative.readSleepSamples(makeNativeDateRangeQuery(query))
    return samples.map(makeSleepSample)
  },
  async saveSteps(samples) {
    assertNonEmptySamples(samples)
    return NitroHealthNative.saveSteps(samples.map(makeNativeStepSampleInput))
  },
  async saveDistance(samples) {
    assertNonEmptySamples(samples)
    return NitroHealthNative.saveDistance(samples.map(makeNativeDistanceSampleInput))
  },
  async saveActiveEnergyBurned(samples) {
    assertNonEmptySamples(samples)
    return NitroHealthNative.saveActiveEnergyBurned(
      samples.map(makeNativeActiveEnergyBurnedSampleInput)
    )
  },
  async saveHeartRate(samples) {
    assertNonEmptySamples(samples)
    return NitroHealthNative.saveHeartRate(samples.map(makeNativeHeartRateSampleInput))
  },
  async saveBodyMass(samples) {
    assertNonEmptySamples(samples)
    return NitroHealthNative.saveBodyMass(samples.map(makeNativeBodyMassSampleInput))
  },
  async saveRestingHeartRate(samples) {
    assertNonEmptySamples(samples)
    return NitroHealthNative.saveRestingHeartRate(
      samples.map(makeNativeRestingHeartRateSampleInput)
    )
  },
  async saveOxygenSaturation(samples) {
    assertNonEmptySamples(samples)
    return NitroHealthNative.saveOxygenSaturation(
      samples.map(makeNativeOxygenSaturationSampleInput)
    )
  },
  async saveHeight(samples) {
    assertNonEmptySamples(samples)
    return NitroHealthNative.saveHeight(samples.map(makeNativeHeightSampleInput))
  },
  async getRequestStatusForAuthorization(permissions) {
    assertPermissions(permissions)
    return NitroHealthNative.getRequestStatusForAuthorization(permissions)
  },
  async requestAuthorization(permissions) {
    assertPermissions(permissions)
    return NitroHealthNative.requestAuthorization(permissions)
  },
}
