import type {
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
}

type NativeChangeSampleField = {
  [K in keyof NativeHealthChange]-?: NonNullable<NativeHealthChange[K]> extends unknown[]
    ? K
    : never
}[keyof NativeHealthChange]

type ReadCase<K extends HealthDataType> = {
  read: () => Promise<HealthSampleByDataType[K]>
  change: NativeHealthChange
}

type ReadMatrix = {
  [K in HealthDataType]: ReadCase<K>
}

type SyncWriteCase = {
  supportsSync: true
  save: () => Promise<unknown>
  nativeMetadata: () => NativeHealthWriteMetadata | undefined
}

type SleepWriteCase = {
  supportsSync: false
  save: () => Promise<unknown>
  nativeMetadata: () => NativeHealthWriteProvenance | undefined
}

type WriteMatrix = {
  [K in WritableHealthDataType]: K extends 'sleep' ? SleepWriteCase : SyncWriteCase
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
  { type: 'smartDisplay', manufacturer: 'Example', model: 'Metadata Sensor' }
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
} as const
const publicSleepProvenance = {
  device,
  recordingMethod: 'automatically-recorded',
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
} satisfies HealthSample

const writeMatrix = {
  steps: {
    supportsSync: true,
    save: () => NitroHealth.saveSteps([{ ...publicWriteMetadata, startDate, endDate, count: 1 }]),
    nativeMetadata: () => mockNitroHealth.saveSteps.mock.calls[0]?.[0][0]?.writeMetadata,
  },
  heartRate: {
    supportsSync: true,
    save: () => NitroHealth.saveHeartRate([{ ...publicWriteMetadata, date: startDate, bpm: 60 }]),
    nativeMetadata: () => mockNitroHealth.saveHeartRate.mock.calls[0]?.[0][0]?.writeMetadata,
  },
  bloodPressure: {
    supportsSync: true,
    save: () =>
      NitroHealth.saveBloodPressure([
        { ...publicWriteMetadata, date: startDate, systolicMmHg: 120, diastolicMmHg: 80 },
      ]),
    nativeMetadata: () => mockNitroHealth.saveBloodPressure.mock.calls[0]?.[0][0]?.writeMetadata,
  },
  bloodGlucose: {
    supportsSync: true,
    save: () =>
      NitroHealth.saveBloodGlucose([
        { ...publicWriteMetadata, date: startDate, millimolesPerLiter: 5 },
      ]),
    nativeMetadata: () => mockNitroHealth.saveBloodGlucose.mock.calls[0]?.[0][0]?.writeMetadata,
  },
  bodyTemperature: {
    supportsSync: true,
    save: () =>
      NitroHealth.saveBodyTemperature([{ ...publicWriteMetadata, date: startDate, celsius: 36.5 }]),
    nativeMetadata: () => mockNitroHealth.saveBodyTemperature.mock.calls[0]?.[0][0]?.writeMetadata,
  },
  respiratoryRate: {
    supportsSync: true,
    save: () =>
      NitroHealth.saveRespiratoryRate([
        { ...publicWriteMetadata, date: startDate, breathsPerMinute: 16 },
      ]),
    nativeMetadata: () => mockNitroHealth.saveRespiratoryRate.mock.calls[0]?.[0][0]?.writeMetadata,
  },
  bodyFat: {
    supportsSync: true,
    save: () =>
      NitroHealth.saveBodyFat([{ ...publicWriteMetadata, date: startDate, percentage: 20 }]),
    nativeMetadata: () => mockNitroHealth.saveBodyFat.mock.calls[0]?.[0][0]?.writeMetadata,
  },
  leanBodyMass: {
    supportsSync: true,
    save: () =>
      NitroHealth.saveLeanBodyMass([{ ...publicWriteMetadata, date: startDate, kilograms: 55 }]),
    nativeMetadata: () => mockNitroHealth.saveLeanBodyMass.mock.calls[0]?.[0][0]?.writeMetadata,
  },
  basalBodyTemperature: {
    supportsSync: true,
    save: () =>
      NitroHealth.saveBasalBodyTemperature([
        { ...publicWriteMetadata, date: startDate, celsius: 36.4 },
      ]),
    nativeMetadata: () =>
      mockNitroHealth.saveBasalBodyTemperature.mock.calls[0]?.[0][0]?.writeMetadata,
  },
  restingHeartRate: {
    supportsSync: true,
    save: () =>
      NitroHealth.saveRestingHeartRate([{ ...publicWriteMetadata, date: startDate, bpm: 55 }]),
    nativeMetadata: () => mockNitroHealth.saveRestingHeartRate.mock.calls[0]?.[0][0]?.writeMetadata,
  },
  distance: {
    supportsSync: true,
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
    supportsSync: true,
    save: () =>
      NitroHealth.saveActiveEnergyBurned([
        { ...publicWriteMetadata, startDate, endDate, kilocalories: 10 },
      ]),
    nativeMetadata: () =>
      mockNitroHealth.saveActiveEnergyBurned.mock.calls[0]?.[0][0]?.writeMetadata,
  },
  hydration: {
    supportsSync: true,
    save: () =>
      NitroHealth.saveHydration([{ ...publicWriteMetadata, startDate, endDate, milliliters: 250 }]),
    nativeMetadata: () => mockNitroHealth.saveHydration.mock.calls[0]?.[0][0]?.writeMetadata,
  },
  floorsClimbed: {
    supportsSync: true,
    save: () =>
      NitroHealth.saveFloorsClimbed([{ ...publicWriteMetadata, startDate, endDate, floors: 2 }]),
    nativeMetadata: () => mockNitroHealth.saveFloorsClimbed.mock.calls[0]?.[0][0]?.writeMetadata,
  },
  oxygenSaturation: {
    supportsSync: true,
    save: () =>
      NitroHealth.saveOxygenSaturation([
        { ...publicWriteMetadata, date: startDate, percentage: 98 },
      ]),
    nativeMetadata: () => mockNitroHealth.saveOxygenSaturation.mock.calls[0]?.[0][0]?.writeMetadata,
  },
  height: {
    supportsSync: true,
    save: () => NitroHealth.saveHeight([{ ...publicWriteMetadata, date: startDate, meters: 1.75 }]),
    nativeMetadata: () => mockNitroHealth.saveHeight.mock.calls[0]?.[0][0]?.writeMetadata,
  },
  vo2Max: {
    supportsSync: true,
    save: () =>
      NitroHealth.saveVo2Max([
        { ...publicWriteMetadata, date: startDate, millilitersPerKilogramPerMinute: 42 },
      ]),
    nativeMetadata: () => mockNitroHealth.saveVo2Max.mock.calls[0]?.[0][0]?.writeMetadata,
  },
  sleep: {
    supportsSync: false,
    save: () => NitroHealth.saveSleepSessions([{ ...publicSleepProvenance, startDate, endDate }]),
    nativeMetadata: () => mockNitroHealth.saveSleepSessions.mock.calls[0]?.[0][0]?.writeProvenance,
  },
  bodyMass: {
    supportsSync: true,
    save: () =>
      NitroHealth.saveBodyMass([{ ...publicWriteMetadata, date: startDate, kilograms: 70 }]),
    nativeMetadata: () => mockNitroHealth.saveBodyMass.mock.calls[0]?.[0][0]?.writeMetadata,
  },
  workout: {
    supportsSync: true,
    save: () =>
      NitroHealth.saveWorkout({
        ...publicWriteMetadata,
        startDate,
        endDate,
        activityType: 'walking',
      }),
    nativeMetadata: () => mockNitroHealth.saveWorkout.mock.calls[0]?.[0].writeMetadata,
  },
} satisfies WriteMatrix

const readCases = Object.entries(readMatrix) as Array<
  { [K in HealthDataType]: [K, (typeof readMatrix)[K]] }[HealthDataType]
>
const writeCases = Object.entries(writeMatrix) as Array<
  { [K in WritableHealthDataType]: [K, (typeof writeMatrix)[K]] }[WritableHealthDataType]
>
type SyncWritableHealthDataType = Exclude<WritableHealthDataType, 'sleep'>
const syncWriteCases = writeCases.filter(
  (
    entry
  ): entry is {
    [K in SyncWritableHealthDataType]: [K, (typeof writeMatrix)[K]]
  }[SyncWritableHealthDataType] => entry[0] !== 'sleep'
)

describe('NitroHealth scalar metadata matrices', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it.each(readCases)(
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

  it.each(syncWriteCases)(
    '%s writes scalar provenance with sync metadata',
    async (_dataType, descriptor) => {
      await descriptor.save()

      expect(descriptor.nativeMetadata()).toEqual(expectedNativeWriteMetadata)
    }
  )

  it('writes sleep provenance without sync metadata', async () => {
    await writeMatrix.sleep.save()

    const nativeMetadata = writeMatrix.sleep.nativeMetadata()
    expect(nativeMetadata).toEqual(expectedNativeProvenance)
    expect(nativeMetadata).not.toHaveProperty('sync')
  })
})
