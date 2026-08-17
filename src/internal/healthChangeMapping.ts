import type { HealthChangesResult } from '../HealthChangesResult'
import type { HealthDataType } from '../HealthDataType'
import type { HealthRecordChange } from '../HealthRecordChange'
import type { HealthSampleByDataType } from '../HealthSampleByDataType'
import type { HealthSampleIdentity } from '../HealthSampleIdentity'
import type { NativeHealthChange } from '../NativeHealthChange'
import type { NativeHealthChangesResult } from '../NativeHealthChangesResult'
import {
  makeActiveEnergyBurnedSample,
  makeBasalBodyTemperatureSample,
  makeBloodGlucoseSample,
  makeBloodPressureSample,
  makeBodyFatSample,
  makeBodyMassSample,
  makeBodyTemperatureSample,
  makeDistanceSample,
  makeFloorsClimbedSample,
  makeHeartRateSample,
  makeHeartRateVariabilitySample,
  makeHeightSample,
  makeHydrationSample,
  makeLeanBodyMassSample,
  makeOxygenSaturationSample,
  makeRespiratoryRateSample,
  makeRestingHeartRateSample,
  makeSleepSample,
  makeStepSample,
  makeVo2MaxSample,
  makeWorkoutSample,
} from './sampleOutputMapping'

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

function getRecordIdentity(identity: HealthSampleIdentity) {
  return identity.kind === 'record' ? identity : identity.record
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
