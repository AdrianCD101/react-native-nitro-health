import type {
  ChangeTrackedHealthDataType,
  HealthDataType,
  HealthSample,
  HealthSampleByDataType,
  WritableHealthDataType,
} from 'react-native-nitro-health'
import type { NativeActiveEnergyBurnedSample } from '../../src/NativeActiveEnergyBurnedSample'
import type { NativeBasalBodyTemperatureSample } from '../../src/NativeBasalBodyTemperatureSample'
import type { NativeBloodGlucoseSample } from '../../src/NativeBloodGlucoseSample'
import type { NativeBloodPressureSample } from '../../src/NativeBloodPressureSample'
import type { NativeBodyFatSample } from '../../src/NativeBodyFatSample'
import type { NativeBodyMassSample } from '../../src/NativeBodyMassSample'
import type { NativeBodyTemperatureSample } from '../../src/NativeBodyTemperatureSample'
import type { NativeDistanceSample } from '../../src/NativeDistanceSample'
import type { NativeFloorsClimbedSample } from '../../src/NativeFloorsClimbedSample'
import type { NativeHealthChange } from '../../src/NativeHealthChange'
import type { NativeHealthWriteMetadata } from '../../src/NativeHealthWriteMetadata'
import type { NativeHealthWriteProvenance } from '../../src/NativeHealthWriteProvenance'
import type { NativeHeartRateSample } from '../../src/NativeHeartRateSample'
import type { NativeHeartRateVariabilitySample } from '../../src/NativeHeartRateVariabilitySample'
import type { NativeHeightSample } from '../../src/NativeHeightSample'
import type { NativeHydrationSample } from '../../src/NativeHydrationSample'
import type { NativeLeanBodyMassSample } from '../../src/NativeLeanBodyMassSample'
import type { NativeNutritionSample } from '../../src/NativeNutritionSample'
import type { NativeOxygenSaturationSample } from '../../src/NativeOxygenSaturationSample'
import type { NativeRespiratoryRateSample } from '../../src/NativeRespiratoryRateSample'
import type { NativeRestingHeartRateSample } from '../../src/NativeRestingHeartRateSample'
import type { NativeSleepSample } from '../../src/NativeSleepSample'
import type { NativeStepSample } from '../../src/NativeStepSample'
import type { NativeVo2MaxSample } from '../../src/NativeVo2MaxSample'
import type { NativeWorkoutSample } from '../../src/NativeWorkoutSample'
import { mockNitroHealth, nativeRecordMetadata } from './support/mockNitroHealth'

jest.mock('react-native-nitro-modules', () => ({
  NitroModules: {
    createHybridObject: jest.fn(() => mockNitroHealth),
  },
}))

import { NitroHealth } from 'react-native-nitro-health'

interface NativeSampleByDataType extends Record<HealthDataType, unknown> {
  steps: NativeStepSample
  heartRate: NativeHeartRateSample
  bloodPressure: NativeBloodPressureSample
  bloodGlucose: NativeBloodGlucoseSample
  bodyTemperature: NativeBodyTemperatureSample
  respiratoryRate: NativeRespiratoryRateSample
  bodyFat: NativeBodyFatSample
  leanBodyMass: NativeLeanBodyMassSample
  basalBodyTemperature: NativeBasalBodyTemperatureSample
  restingHeartRate: NativeRestingHeartRateSample
  heartRateVariability: NativeHeartRateVariabilitySample
  distance: NativeDistanceSample
  activeEnergyBurned: NativeActiveEnergyBurnedSample
  hydration: NativeHydrationSample
  floorsClimbed: NativeFloorsClimbedSample
  oxygenSaturation: NativeOxygenSaturationSample
  height: NativeHeightSample
  vo2Max: NativeVo2MaxSample
  sleep: NativeSleepSample
  bodyMass: NativeBodyMassSample
  workout: NativeWorkoutSample
  nutrition: NativeNutritionSample
}

type NativeChangeSampleField = {
  [K in keyof NativeHealthChange]-?: NonNullable<NativeHealthChange[K]> extends unknown[]
    ? K
    : never
}[keyof NativeHealthChange]

// Change tracking is deferred for nutrition, so its case carries no change payload and the
// matrix test asserts the loud rejection instead of a change round-trip.
type ReadCase<K extends HealthDataType> = {
  read: () => Promise<HealthSampleByDataType[K]>
} & (K extends ChangeTrackedHealthDataType
  ? { change: NativeHealthChange }
  : { change?: undefined })

type ReadMatrix = {
  [K in HealthDataType]: ReadCase<K>
}

type WriteCase = {
  save: () => Promise<unknown>
  nativeMetadata: () => NativeHealthWriteMetadata | undefined
}

type WriteMatrix = {
  [K in WritableHealthDataType]: WriteCase
}

const recordId = 'metadata-record'
const startDate = new Date('2026-01-01T09:00:00.000Z')
const endDate = new Date('2026-01-01T09:30:00.000Z')
const startTimeMs = startDate.getTime()
const endTimeMs = endDate.getTime()
const query = { startDate, endDate }
const sampleMetadata = nativeRecordMetadata(
  recordId,
  'com.example.metadata',
  'Metadata Source',
  'automaticallyRecorded',
  { type: 'smartDisplay', manufacturer: 'Example', model: 'Metadata Sensor' },
  { zoneOffset: '-05:00', timeZone: 'America/New_York' }
)

const nativeSamples = {
  steps: { ...sampleMetadata, startTimeMs, endTimeMs, count: 1 },
  heartRate: { ...sampleMetadata, timeMs: startTimeMs, bpm: 60 },
  bloodPressure: {
    ...sampleMetadata,
    timeMs: startTimeMs,
    systolicMmHg: 120,
    diastolicMmHg: 80,
  },
  bloodGlucose: { ...sampleMetadata, timeMs: startTimeMs, millimolesPerLiter: 5 },
  bodyTemperature: { ...sampleMetadata, timeMs: startTimeMs, celsius: 36.5 },
  respiratoryRate: { ...sampleMetadata, timeMs: startTimeMs, breathsPerMinute: 16 },
  bodyFat: { ...sampleMetadata, timeMs: startTimeMs, percentage: 20 },
  leanBodyMass: { ...sampleMetadata, timeMs: startTimeMs, kilograms: 55 },
  basalBodyTemperature: { ...sampleMetadata, timeMs: startTimeMs, celsius: 36.4 },
  restingHeartRate: { ...sampleMetadata, timeMs: startTimeMs, bpm: 55 },
  heartRateVariability: {
    ...sampleMetadata,
    timeMs: startTimeMs,
    milliseconds: 40,
    method: 'sdnn',
  },
  distance: {
    ...sampleMetadata,
    startTimeMs,
    endTimeMs,
    distanceMeters: 100,
    scope: 'walkingRunning',
  },
  activeEnergyBurned: { ...sampleMetadata, startTimeMs, endTimeMs, kilocalories: 10 },
  hydration: { ...sampleMetadata, startTimeMs, endTimeMs, milliliters: 250 },
  floorsClimbed: { ...sampleMetadata, startTimeMs, endTimeMs, floors: 2 },
  oxygenSaturation: { ...sampleMetadata, timeMs: startTimeMs, percentage: 98 },
  height: { ...sampleMetadata, timeMs: startTimeMs, meters: 1.75 },
  vo2Max: {
    ...sampleMetadata,
    timeMs: startTimeMs,
    millilitersPerKilogramPerMinute: 42,
  },
  sleep: {
    ...sampleMetadata,
    kind: 'sessionEnvelope',
    startTimeMs,
    endTimeMs,
    stageData: 'notReported',
  },
  bodyMass: { ...sampleMetadata, startTimeMs, endTimeMs, kilograms: 70 },
  nutrition: {
    ...sampleMetadata,
    startTimeMs,
    endTimeMs,
    foodName: 'Chicken salad',
    mealType: 'lunch',
    energyKilocalories: 640,
    proteinGrams: 42,
  },
  workout: {
    ...sampleMetadata,
    startTimeMs,
    endTimeMs,
    elapsedDurationSeconds: 1800,
    activeDuration: { status: 'notReported' },
    activity: { status: 'unknown' },
    totalDistance: { status: 'notReported' },
    totalActiveEnergyBurned: { status: 'notReported' },
  },
} satisfies NativeSampleByDataType

function nativeUpsert<K extends NativeChangeSampleField>(
  field: K,
  samples: NonNullable<NativeHealthChange[K]>
): NativeHealthChange {
  return { type: 'upsert', recordId, [field]: samples } as NativeHealthChange
}

const readMatrix = {
  steps: {
    async read() {
      mockNitroHealth.readSteps.mockResolvedValue({ samples: [nativeSamples.steps] })
      return (await NitroHealth.readSteps(query)).samples[0]!
    },
    change: nativeUpsert('stepSamples', [nativeSamples.steps]),
  },
  heartRate: {
    async read() {
      mockNitroHealth.readHeartRate.mockResolvedValue({ samples: [nativeSamples.heartRate] })
      return (await NitroHealth.readHeartRate(query)).samples[0]!
    },
    change: nativeUpsert('heartRateSamples', [nativeSamples.heartRate]),
  },
  bloodPressure: {
    async read() {
      mockNitroHealth.readBloodPressure.mockResolvedValue({
        samples: [nativeSamples.bloodPressure],
      })
      return (await NitroHealth.readBloodPressure(query)).samples[0]!
    },
    change: nativeUpsert('bloodPressureSamples', [nativeSamples.bloodPressure]),
  },
  bloodGlucose: {
    async read() {
      mockNitroHealth.readBloodGlucose.mockResolvedValue({ samples: [nativeSamples.bloodGlucose] })
      return (await NitroHealth.readBloodGlucose(query)).samples[0]!
    },
    change: nativeUpsert('bloodGlucoseSamples', [nativeSamples.bloodGlucose]),
  },
  bodyTemperature: {
    async read() {
      mockNitroHealth.readBodyTemperature.mockResolvedValue({
        samples: [nativeSamples.bodyTemperature],
      })
      return (await NitroHealth.readBodyTemperature(query)).samples[0]!
    },
    change: nativeUpsert('bodyTemperatureSamples', [nativeSamples.bodyTemperature]),
  },
  respiratoryRate: {
    async read() {
      mockNitroHealth.readRespiratoryRate.mockResolvedValue({
        samples: [nativeSamples.respiratoryRate],
      })
      return (await NitroHealth.readRespiratoryRate(query)).samples[0]!
    },
    change: nativeUpsert('respiratoryRateSamples', [nativeSamples.respiratoryRate]),
  },
  bodyFat: {
    async read() {
      mockNitroHealth.readBodyFat.mockResolvedValue({ samples: [nativeSamples.bodyFat] })
      return (await NitroHealth.readBodyFat(query)).samples[0]!
    },
    change: nativeUpsert('bodyFatSamples', [nativeSamples.bodyFat]),
  },
  leanBodyMass: {
    async read() {
      mockNitroHealth.readLeanBodyMass.mockResolvedValue({ samples: [nativeSamples.leanBodyMass] })
      return (await NitroHealth.readLeanBodyMass(query)).samples[0]!
    },
    change: nativeUpsert('leanBodyMassSamples', [nativeSamples.leanBodyMass]),
  },
  basalBodyTemperature: {
    async read() {
      mockNitroHealth.readBasalBodyTemperature.mockResolvedValue({
        samples: [nativeSamples.basalBodyTemperature],
      })
      return (await NitroHealth.readBasalBodyTemperature(query)).samples[0]!
    },
    change: nativeUpsert('basalBodyTemperatureSamples', [nativeSamples.basalBodyTemperature]),
  },
  restingHeartRate: {
    async read() {
      mockNitroHealth.readRestingHeartRate.mockResolvedValue({
        samples: [nativeSamples.restingHeartRate],
      })
      return (await NitroHealth.readRestingHeartRate(query)).samples[0]!
    },
    change: nativeUpsert('restingHeartRateSamples', [nativeSamples.restingHeartRate]),
  },
  heartRateVariability: {
    async read() {
      mockNitroHealth.readHeartRateVariability.mockResolvedValue({
        samples: [nativeSamples.heartRateVariability],
      })
      return (await NitroHealth.readHeartRateVariability(query)).samples[0]!
    },
    change: nativeUpsert('heartRateVariabilitySamples', [nativeSamples.heartRateVariability]),
  },
  distance: {
    async read() {
      mockNitroHealth.readDistance.mockResolvedValue({ samples: [nativeSamples.distance] })
      return (await NitroHealth.readDistance(query)).samples[0]!
    },
    change: nativeUpsert('distanceSamples', [nativeSamples.distance]),
  },
  activeEnergyBurned: {
    async read() {
      mockNitroHealth.readActiveEnergyBurned.mockResolvedValue({
        samples: [nativeSamples.activeEnergyBurned],
      })
      return (await NitroHealth.readActiveEnergyBurned(query)).samples[0]!
    },
    change: nativeUpsert('activeEnergyBurnedSamples', [nativeSamples.activeEnergyBurned]),
  },
  hydration: {
    async read() {
      mockNitroHealth.readHydration.mockResolvedValue({ samples: [nativeSamples.hydration] })
      return (await NitroHealth.readHydration(query)).samples[0]!
    },
    change: nativeUpsert('hydrationSamples', [nativeSamples.hydration]),
  },
  floorsClimbed: {
    async read() {
      mockNitroHealth.readFloorsClimbed.mockResolvedValue({
        samples: [nativeSamples.floorsClimbed],
      })
      return (await NitroHealth.readFloorsClimbed(query)).samples[0]!
    },
    change: nativeUpsert('floorsClimbedSamples', [nativeSamples.floorsClimbed]),
  },
  oxygenSaturation: {
    async read() {
      mockNitroHealth.readOxygenSaturation.mockResolvedValue({
        samples: [nativeSamples.oxygenSaturation],
      })
      return (await NitroHealth.readOxygenSaturation(query)).samples[0]!
    },
    change: nativeUpsert('oxygenSaturationSamples', [nativeSamples.oxygenSaturation]),
  },
  height: {
    async read() {
      mockNitroHealth.readHeight.mockResolvedValue({ samples: [nativeSamples.height] })
      return (await NitroHealth.readHeight(query)).samples[0]!
    },
    change: nativeUpsert('heightSamples', [nativeSamples.height]),
  },
  vo2Max: {
    async read() {
      mockNitroHealth.readVo2Max.mockResolvedValue({ samples: [nativeSamples.vo2Max] })
      return (await NitroHealth.readVo2Max(query)).samples[0]!
    },
    change: nativeUpsert('vo2MaxSamples', [nativeSamples.vo2Max]),
  },
  sleep: {
    async read() {
      mockNitroHealth.readSleepSamples.mockResolvedValue({ samples: [nativeSamples.sleep] })
      return (await NitroHealth.readSleepSamples(query)).samples[0]!
    },
    change: nativeUpsert('sleepSamples', [nativeSamples.sleep]),
  },
  bodyMass: {
    async read() {
      mockNitroHealth.readBodyMass.mockResolvedValue({ samples: [nativeSamples.bodyMass] })
      return (await NitroHealth.readBodyMass(query)).samples[0]!
    },
    change: nativeUpsert('bodyMassSamples', [nativeSamples.bodyMass]),
  },
  workout: {
    async read() {
      mockNitroHealth.readWorkouts.mockResolvedValue({ samples: [nativeSamples.workout] })
      return (await NitroHealth.readWorkouts(query)).samples[0]!
    },
    change: nativeUpsert('workoutSamples', [nativeSamples.workout]),
  },
  nutrition: {
    async read() {
      mockNitroHealth.readNutrition.mockResolvedValue({ samples: [nativeSamples.nutrition] })
      return (await NitroHealth.readNutrition(query)).samples[0]!
    },
    change: undefined,
  },
} satisfies ReadMatrix

const sync = { id: 'metadata-sync-id', version: 4 } as const
const device = {
  type: 'smart-display',
  manufacturer: 'Example',
  model: 'Metadata Sensor',
} as const
const publicWriteMetadata = {
  device,
  recordingMethod: 'automatically-recorded',
  sync,
  timeZone: 'America/New_York',
} as const
const expectedNativeProvenance = {
  deviceType: 'smartDisplay',
  deviceManufacturer: 'Example',
  deviceModel: 'Metadata Sensor',
  recordingMethod: 'automaticallyRecorded',
} satisfies NativeHealthWriteProvenance
const expectedNativeWriteMetadata = {
  provenance: expectedNativeProvenance,
  sync,
  timeZone: 'America/New_York',
} satisfies NativeHealthWriteMetadata
const expectedSampleMetadata = {
  identity: { kind: 'record', id: recordId },
  origin: { identifier: 'com.example.metadata', displayName: 'Metadata Source' },
  device: {
    type: 'smart-display',
    manufacturer: 'Example',
    model: 'Metadata Sensor',
  },
  recordingMethod: 'automatically-recorded',
  zoneOffset: '-05:00',
  timeZone: 'America/New_York',
} satisfies HealthSample

const writeMatrix = {
  steps: {
    save: () => NitroHealth.saveSteps([{ ...publicWriteMetadata, startDate, endDate, count: 1 }]),
    nativeMetadata: () => mockNitroHealth.saveSteps.mock.calls[0]?.[0][0]?.writeMetadata,
  },
  heartRate: {
    save: () => NitroHealth.saveHeartRate([{ ...publicWriteMetadata, date: startDate, bpm: 60 }]),
    nativeMetadata: () => mockNitroHealth.saveHeartRate.mock.calls[0]?.[0][0]?.writeMetadata,
  },
  bloodPressure: {
    save: () =>
      NitroHealth.saveBloodPressure([
        { ...publicWriteMetadata, date: startDate, systolicMmHg: 120, diastolicMmHg: 80 },
      ]),
    nativeMetadata: () => mockNitroHealth.saveBloodPressure.mock.calls[0]?.[0][0]?.writeMetadata,
  },
  bloodGlucose: {
    save: () =>
      NitroHealth.saveBloodGlucose([
        { ...publicWriteMetadata, date: startDate, millimolesPerLiter: 5 },
      ]),
    nativeMetadata: () => mockNitroHealth.saveBloodGlucose.mock.calls[0]?.[0][0]?.writeMetadata,
  },
  bodyTemperature: {
    save: () =>
      NitroHealth.saveBodyTemperature([{ ...publicWriteMetadata, date: startDate, celsius: 36.5 }]),
    nativeMetadata: () => mockNitroHealth.saveBodyTemperature.mock.calls[0]?.[0][0]?.writeMetadata,
  },
  respiratoryRate: {
    save: () =>
      NitroHealth.saveRespiratoryRate([
        { ...publicWriteMetadata, date: startDate, breathsPerMinute: 16 },
      ]),
    nativeMetadata: () => mockNitroHealth.saveRespiratoryRate.mock.calls[0]?.[0][0]?.writeMetadata,
  },
  bodyFat: {
    save: () =>
      NitroHealth.saveBodyFat([{ ...publicWriteMetadata, date: startDate, percentage: 20 }]),
    nativeMetadata: () => mockNitroHealth.saveBodyFat.mock.calls[0]?.[0][0]?.writeMetadata,
  },
  leanBodyMass: {
    save: () =>
      NitroHealth.saveLeanBodyMass([{ ...publicWriteMetadata, date: startDate, kilograms: 55 }]),
    nativeMetadata: () => mockNitroHealth.saveLeanBodyMass.mock.calls[0]?.[0][0]?.writeMetadata,
  },
  basalBodyTemperature: {
    save: () =>
      NitroHealth.saveBasalBodyTemperature([
        { ...publicWriteMetadata, date: startDate, celsius: 36.4 },
      ]),
    nativeMetadata: () =>
      mockNitroHealth.saveBasalBodyTemperature.mock.calls[0]?.[0][0]?.writeMetadata,
  },
  restingHeartRate: {
    save: () =>
      NitroHealth.saveRestingHeartRate([{ ...publicWriteMetadata, date: startDate, bpm: 55 }]),
    nativeMetadata: () => mockNitroHealth.saveRestingHeartRate.mock.calls[0]?.[0][0]?.writeMetadata,
  },
  distance: {
    save: () =>
      NitroHealth.saveDistance([
        {
          ...publicWriteMetadata,
          scope: 'walking-running',
          startDate,
          endDate,
          distanceMeters: 100,
        },
      ]),
    nativeMetadata: () => mockNitroHealth.saveDistance.mock.calls[0]?.[0][0]?.writeMetadata,
  },
  activeEnergyBurned: {
    save: () =>
      NitroHealth.saveActiveEnergyBurned([
        { ...publicWriteMetadata, startDate, endDate, kilocalories: 10 },
      ]),
    nativeMetadata: () =>
      mockNitroHealth.saveActiveEnergyBurned.mock.calls[0]?.[0][0]?.writeMetadata,
  },
  hydration: {
    save: () =>
      NitroHealth.saveHydration([{ ...publicWriteMetadata, startDate, endDate, milliliters: 250 }]),
    nativeMetadata: () => mockNitroHealth.saveHydration.mock.calls[0]?.[0][0]?.writeMetadata,
  },
  floorsClimbed: {
    save: () =>
      NitroHealth.saveFloorsClimbed([{ ...publicWriteMetadata, startDate, endDate, floors: 2 }]),
    nativeMetadata: () => mockNitroHealth.saveFloorsClimbed.mock.calls[0]?.[0][0]?.writeMetadata,
  },
  oxygenSaturation: {
    save: () =>
      NitroHealth.saveOxygenSaturation([
        { ...publicWriteMetadata, date: startDate, percentage: 98 },
      ]),
    nativeMetadata: () => mockNitroHealth.saveOxygenSaturation.mock.calls[0]?.[0][0]?.writeMetadata,
  },
  height: {
    save: () => NitroHealth.saveHeight([{ ...publicWriteMetadata, date: startDate, meters: 1.75 }]),
    nativeMetadata: () => mockNitroHealth.saveHeight.mock.calls[0]?.[0][0]?.writeMetadata,
  },
  vo2Max: {
    save: () =>
      NitroHealth.saveVo2Max([
        { ...publicWriteMetadata, date: startDate, millilitersPerKilogramPerMinute: 42 },
      ]),
    nativeMetadata: () => mockNitroHealth.saveVo2Max.mock.calls[0]?.[0][0]?.writeMetadata,
  },
  sleep: {
    save: () => NitroHealth.saveSleepSessions([{ ...publicWriteMetadata, startDate, endDate }]),
    nativeMetadata: () => mockNitroHealth.saveSleepSessions.mock.calls[0]?.[0][0]?.writeMetadata,
  },
  bodyMass: {
    save: () =>
      NitroHealth.saveBodyMass([{ ...publicWriteMetadata, date: startDate, kilograms: 70 }]),
    nativeMetadata: () => mockNitroHealth.saveBodyMass.mock.calls[0]?.[0][0]?.writeMetadata,
  },
  workout: {
    save: () =>
      NitroHealth.saveWorkout({
        ...publicWriteMetadata,
        startDate,
        endDate,
        activityType: 'walking',
      }),
    nativeMetadata: () => mockNitroHealth.saveWorkout.mock.calls[0]?.[0].writeMetadata,
  },
  nutrition: {
    save: () =>
      NitroHealth.saveNutrition([{ ...publicWriteMetadata, startDate, endDate, proteinGrams: 42 }]),
    nativeMetadata: () => mockNitroHealth.saveNutrition.mock.calls[0]?.[0][0]?.writeMetadata,
  },
} satisfies WriteMatrix

const readCases = Object.entries(readMatrix) as Array<
  { [K in HealthDataType]: [K, (typeof readMatrix)[K]] }[HealthDataType]
>
// Nutrition reads participate in the metadata matrix but change tracking is deferred for
// it, so the change round-trip runs only for change-tracked types and nutrition gets a
// dedicated rejection test below.
const changeTrackedReadCases = readCases.filter(
  (
    entry
  ): entry is {
    [K in ChangeTrackedHealthDataType]: [K, (typeof readMatrix)[K]]
  }[ChangeTrackedHealthDataType] => entry[1].change !== undefined
)
const writeCases = Object.entries(writeMatrix) as Array<
  { [K in WritableHealthDataType]: [K, (typeof writeMatrix)[K]] }[WritableHealthDataType]
>

describe('NitroHealth scalar metadata matrices', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it.each(changeTrackedReadCases)(
    '%s maps common metadata identically for reads and changes',
    async (dataType, descriptor) => {
      const readSample = await descriptor.read()

      expect(readSample).toMatchObject(expectedSampleMetadata)

      mockNitroHealth.getChanges.mockResolvedValue({
        changes: [descriptor.change],
        nextChangesToken: 'next-token',
        hasMore: false,
        tokenExpired: false,
      })

      const changesResult = await NitroHealth.getChanges(dataType, 'current-token')
      expect(changesResult.tokenExpired).toBe(false)
      if (changesResult.tokenExpired) throw new Error('Expected a usable changes result')

      const change = changesResult.changes[0]
      expect(change?.type).toBe('upsert')
      if (change?.type !== 'upsert') throw new Error('Expected an upsert change')
      expect(change.samples).toEqual([readSample])
    }
  )

  it('nutrition maps common metadata for reads and rejects change tracking', async () => {
    const readSample = await readMatrix.nutrition.read()

    expect(readSample).toMatchObject(expectedSampleMetadata)

    await expect(
      NitroHealth.getChanges('nutrition' as ChangeTrackedHealthDataType, 'current-token')
    ).rejects.toThrow("Change tracking is not supported for 'nutrition' yet")
    expect(mockNitroHealth.getChanges).not.toHaveBeenCalled()
  })

  it.each(writeCases)(
    '%s writes scalar provenance with sync metadata',
    async (_dataType, descriptor) => {
      await descriptor.save()

      expect(descriptor.nativeMetadata()).toEqual(expectedNativeWriteMetadata)
    }
  )
})
