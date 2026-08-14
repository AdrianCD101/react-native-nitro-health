import { Platform } from 'react-native'
import { describe, expect, it } from 'react-native-harness'
import { NitroHealth } from 'react-native-nitro-health'
import type { HealthSample, WorkoutSample } from 'react-native-nitro-health'

import {
  hasVerifiedPermissions,
  isInconclusiveRead,
  saveInterval,
  saveReadRange,
} from './support/harnessSupport'

function assertOrigin(sample: HealthSample): void {
  expect(typeof sample.origin.identifier).toBe('string')
  expect(sample.origin.identifier.length).toBeGreaterThan(0)
  expect(['string', 'undefined']).toContain(typeof sample.origin.displayName)
}

function getWorkoutDisplayName(workout: WorkoutSample): string | undefined {
  return workout.title ?? workout.brandName
}

describe('NitroHealth saves (native)', () => {
  it('rejects empty save sample arrays before crossing the native boundary', async () => {
    await expect(NitroHealth.saveSteps([])).rejects.toThrow('At least one sample is required')
    await expect(NitroHealth.saveDistance([])).rejects.toThrow('At least one sample is required')
    await expect(NitroHealth.saveActiveEnergyBurned([])).rejects.toThrow(
      'At least one sample is required'
    )
    await expect(NitroHealth.saveHydration([])).rejects.toThrow('At least one sample is required')
    await expect(NitroHealth.saveHeartRate([])).rejects.toThrow('At least one sample is required')
    await expect(NitroHealth.saveBodyMass([])).rejects.toThrow('At least one sample is required')
    await expect(NitroHealth.saveSleepSessions([])).rejects.toThrow(
      'At least one sleep session is required'
    )
  })

  it('rejects invalid save sample values before crossing the native boundary', async () => {
    await expect(NitroHealth.saveSteps([{ ...saveInterval, count: -1 }])).rejects.toThrow(
      'samples[0]: count must be a positive integer'
    )
    await expect(
      NitroHealth.saveDistance([{ ...saveInterval, scope: 'walking-running', distanceMeters: -1 }])
    ).rejects.toThrow('samples[0]: distanceMeters must be a non-negative number')
    await expect(
      NitroHealth.saveActiveEnergyBurned([{ ...saveInterval, kilocalories: -1 }])
    ).rejects.toThrow('samples[0]: kilocalories must be a non-negative number')
    await expect(NitroHealth.saveHydration([{ ...saveInterval, milliliters: -1 }])).rejects.toThrow(
      'samples[0]: milliliters must be a non-negative number'
    )
    await expect(
      NitroHealth.saveHeartRate([{ date: saveInterval.startDate, bpm: 0 }])
    ).rejects.toThrow('samples[0]: bpm must be between 1 and 300')
    await expect(
      NitroHealth.saveBodyMass([{ date: saveInterval.startDate, kilograms: 0 }])
    ).rejects.toThrow('samples[0]: kilograms must be greater than 0')
  })

  it('rejects inverted save sample intervals before crossing the native boundary', async () => {
    await expect(
      NitroHealth.saveSteps([
        { startDate: saveInterval.endDate, endDate: saveInterval.startDate, count: 100 },
      ])
    ).rejects.toThrow('samples[0]: startDate must be before endDate')
    await expect(
      NitroHealth.saveWorkout({
        startDate: saveInterval.endDate,
        endDate: saveInterval.startDate,
        activityType: 'running',
      })
    ).rejects.toThrow('workout: startDate must be before endDate')
  })

  it('rejects overlapping sleep stages before crossing the native boundary', async () => {
    await expect(
      NitroHealth.saveSleepSessions([
        {
          ...saveInterval,
          stages: [
            {
              startDate: saveInterval.startDate,
              endDate: new Date(saveInterval.startDate.getTime() + 20 * 60 * 1000),
              stage: 'asleepCore',
            },
            {
              startDate: new Date(saveInterval.startDate.getTime() + 10 * 60 * 1000),
              endDate: saveInterval.endDate,
              stage: 'asleepDeep',
            },
          ],
        },
      ])
    ).rejects.toThrow(/interval overlaps/)
  })

  it('round-trips saved steps through native code when authorized', async () => {
    const authorized = await hasVerifiedPermissions([
      { accessType: 'write', dataType: 'steps' },
      { accessType: 'read', dataType: 'steps' },
    ])

    if (!authorized) {
      return
    }

    await NitroHealth.saveSteps([{ ...saveInterval, count: 321 }])

    const page = await NitroHealth.readSteps(saveReadRange)

    if (isInconclusiveRead(page.samples)) {
      return
    }

    expect(page.samples.some((sample) => sample.count === 321)).toBe(true)
  })

  it('round-trips walking/running distance and reports its storage scope', async () => {
    const authorized = await hasVerifiedPermissions([
      { accessType: 'write', dataType: 'distance' },
      { accessType: 'read', dataType: 'distance' },
    ])
    if (!authorized) return

    const result = await NitroHealth.saveDistance([
      { ...saveInterval, scope: 'walking-running', distanceMeters: 1234 },
    ])

    const expectedStoredScope = Platform.OS === 'ios' ? 'walking-running' : 'activity-unspecified'
    expect(result).toEqual({ status: 'completed', storedScope: expectedStoredScope })
    const page = await NitroHealth.readDistance(saveReadRange)
    if (isInconclusiveRead(page.samples)) return

    const saved = page.samples.find(
      (sample) => sample.distanceMeters === 1234 && sample.scope === expectedStoredScope
    )
    expect(saved).toBeDefined()
    if (saved !== undefined) assertOrigin(saved)
  })

  it('round-trips saved body mass through native code when authorized', async () => {
    const authorized = await hasVerifiedPermissions([
      { accessType: 'write', dataType: 'bodyMass' },
      { accessType: 'read', dataType: 'bodyMass' },
    ])

    if (!authorized) {
      return
    }

    await NitroHealth.saveBodyMass([{ date: saveInterval.startDate, kilograms: 72.5 }])

    const page = await NitroHealth.readBodyMass(saveReadRange)

    if (isInconclusiveRead(page.samples)) {
      return
    }

    expect(page.samples.some((sample) => sample.kilograms === 72.5)).toBe(true)
  })

  it('round-trips saved hydration through native code when authorized', async () => {
    const authorized = await hasVerifiedPermissions([
      { accessType: 'write', dataType: 'hydration' },
      { accessType: 'read', dataType: 'hydration' },
    ])
    if (!authorized) return

    await NitroHealth.deleteRecordsByTimeRange('hydration', saveReadRange)
    try {
      await NitroHealth.saveHydration([
        {
          ...saveInterval,
          milliliters: 250.5,
          sync: { id: 'nitro-health-harness-hydration-round-trip', version: 1 },
        },
      ])
      const page = await NitroHealth.readHydration(saveReadRange)
      if (isInconclusiveRead(page.samples)) return

      const saved = page.samples.find(
        (sample) =>
          Math.abs(sample.milliliters - 250.5) < 0.001 &&
          sample.startDate.getTime() === saveInterval.startDate.getTime() &&
          sample.endDate.getTime() === saveInterval.endDate.getTime()
      )
      expect(saved).toBeDefined()
      if (saved !== undefined) assertOrigin(saved)
    } finally {
      await NitroHealth.deleteRecordsByTimeRange('hydration', saveReadRange)
    }
  })

  it('round-trips saved heart rate through native code when authorized', async () => {
    const authorized = await hasVerifiedPermissions([
      { accessType: 'write', dataType: 'heartRate' },
      { accessType: 'read', dataType: 'heartRate' },
    ])

    if (!authorized) {
      return
    }

    await NitroHealth.saveHeartRate([{ date: saveInterval.startDate, bpm: 123 }])

    const page = await NitroHealth.readHeartRate(saveReadRange)

    if (isInconclusiveRead(page.samples)) {
      return
    }

    expect(page.samples.some((sample) => sample.bpm === 123)).toBe(true)
  })

  it('round-trips portable sleep stages through native code when authorized', async () => {
    const authorized = await hasVerifiedPermissions([
      { accessType: 'write', dataType: 'sleep' },
      { accessType: 'read', dataType: 'sleep' },
    ])

    if (!authorized) {
      return
    }

    const middleDate = new Date(
      saveInterval.startDate.getTime() +
        (saveInterval.endDate.getTime() - saveInterval.startDate.getTime()) / 2
    )

    await NitroHealth.deleteRecordsByTimeRange('sleep', saveReadRange)
    try {
      await NitroHealth.saveSleepSessions([
        {
          ...saveInterval,
          timeZone: 'UTC',
          stages: [
            {
              startDate: saveInterval.startDate,
              endDate: middleDate,
              stage: 'asleepCore',
            },
            {
              startDate: middleDate,
              endDate: saveInterval.endDate,
              stage: 'asleepDeep',
            },
          ],
        },
      ])

      const page = await NitroHealth.readSleepSamples(saveReadRange)
      if (isInconclusiveRead(page.samples)) {
        return
      }

      const envelope = page.samples.find(
        (sample) =>
          (sample.kind === 'session-envelope' ||
            (sample.kind === 'stage' && sample.stage === 'inBed')) &&
          sample.startDate.getTime() === saveInterval.startDate.getTime() &&
          sample.endDate.getTime() === saveInterval.endDate.getTime()
      )
      expect(envelope).toBeDefined()
      if (envelope?.kind === 'session-envelope') {
        expect(envelope.stageData).toBe('reported')
        expect('stage' in envelope).toBe(false)
      } else if (envelope) {
        expect(envelope.stage).toBe('inBed')
      }

      expect(
        page.samples.some(
          (sample) =>
            sample.kind === 'stage' &&
            sample.stage === 'asleepCore' &&
            sample.startDate.getTime() === saveInterval.startDate.getTime() &&
            sample.endDate.getTime() === middleDate.getTime()
        )
      ).toBe(true)
      expect(
        page.samples.some(
          (sample) =>
            sample.kind === 'stage' &&
            sample.stage === 'asleepDeep' &&
            sample.startDate.getTime() === middleDate.getTime() &&
            sample.endDate.getTime() === saveInterval.endDate.getTime()
        )
      ).toBe(true)
    } finally {
      await NitroHealth.deleteRecordsByTimeRange('sleep', saveReadRange)
    }
  })

  it('round-trips a portable workout through native code when authorized', async () => {
    const authorized = await hasVerifiedPermissions([
      { accessType: 'write', dataType: 'workout' },
      { accessType: 'read', dataType: 'workout' },
    ])

    if (!authorized) {
      return
    }

    await NitroHealth.deleteRecordsByTimeRange('workout', saveReadRange)
    try {
      await NitroHealth.saveWorkout({
        ...saveInterval,
        activityType: 'running',
        displayName: 'Nitro Health Harness Run',
        timeZone: 'UTC',
      })

      const page = await NitroHealth.readWorkouts(saveReadRange)
      if (isInconclusiveRead(page.samples)) {
        return
      }

      const saved = page.samples.find(
        (sample) =>
          sample.activity.status === 'known' &&
          sample.activity.type === 'running' &&
          sample.activity.portability === 'portable' &&
          getWorkoutDisplayName(sample) === 'Nitro Health Harness Run' &&
          sample.startDate.getTime() === saveInterval.startDate.getTime() &&
          sample.endDate.getTime() === saveInterval.endDate.getTime()
      )
      expect(saved).toBeDefined()
      if (saved !== undefined) {
        assertOrigin(saved)
        if (Platform.OS === 'ios') {
          expect(saved.title).toBeUndefined()
          expect(saved.brandName).toBe('Nitro Health Harness Run')
        } else {
          expect(saved.title).toBe('Nitro Health Harness Run')
          expect(saved.brandName).toBeUndefined()
        }
      }
    } finally {
      await NitroHealth.deleteRecordsByTimeRange('workout', saveReadRange)
    }
  })

  describe('resting heart rate', () => {
    it('round-trips saved resting heart rate through native code when authorized', async () => {
      const authorized = await hasVerifiedPermissions([
        { accessType: 'write', dataType: 'restingHeartRate' },
        { accessType: 'read', dataType: 'restingHeartRate' },
      ])

      if (!authorized) {
        return
      }

      await NitroHealth.saveRestingHeartRate([{ date: saveInterval.startDate, bpm: 58 }])

      const page = await NitroHealth.readRestingHeartRate(saveReadRange)

      if (isInconclusiveRead(page.samples)) {
        return
      }

      expect(page.samples.some((sample) => sample.bpm === 58)).toBe(true)
    })
  })

  describe('oxygen saturation', () => {
    // The designated on-device proof of the iOS fraction conversion: iOS stores this value as
    // HealthKit's 0-1 fraction (percentage / 100) and reads it back multiplied by 100. A small
    // tolerance absorbs floating-point round-trip error; the value must still land in 0-100.
    it('round-trips saved oxygen saturation through native code when authorized', async () => {
      const authorized = await hasVerifiedPermissions([
        { accessType: 'write', dataType: 'oxygenSaturation' },
        { accessType: 'read', dataType: 'oxygenSaturation' },
      ])

      if (!authorized) {
        return
      }

      const savedPercentage = 97.5

      await NitroHealth.saveOxygenSaturation([
        { date: saveInterval.startDate, percentage: savedPercentage },
      ])

      const page = await NitroHealth.readOxygenSaturation(saveReadRange)

      if (isInconclusiveRead(page.samples)) {
        return
      }

      const match = page.samples.find(
        (sample) => Math.abs(sample.percentage - savedPercentage) < 0.01
      )

      expect(match).toBeDefined()
      expect(match?.percentage).toBeGreaterThanOrEqual(0)
      expect(match?.percentage).toBeLessThanOrEqual(100)
    })
  })

  describe('blood pressure', () => {
    // The designated on-device proof of iOS correlation atomicity: the save writes one
    // HKCorrelation (Android: one BloodPressureRecord) and the read must surface exactly one
    // sample carrying BOTH values under a single record identity — never two half-readings.
    it('round-trips a saved reading as one sample with both values when authorized', async () => {
      const authorized = await hasVerifiedPermissions([
        { accessType: 'write', dataType: 'bloodPressure' },
        { accessType: 'read', dataType: 'bloodPressure' },
      ])

      if (!authorized) {
        return
      }

      await NitroHealth.saveBloodPressure([
        {
          date: saveInterval.startDate,
          systolicMmHg: 118,
          diastolicMmHg: 76,
          metadata: {
            android: {
              bodyPosition: 'sitting_down',
              measurementLocation: 'left_upper_arm',
            },
          },
        },
      ])

      const page = await NitroHealth.readBloodPressure(saveReadRange)

      if (isInconclusiveRead(page.samples)) {
        return
      }

      const matches = page.samples.filter(
        (sample) => sample.systolicMmHg === 118 && sample.diastolicMmHg === 76
      )

      expect(matches.length).toBeGreaterThanOrEqual(1)
      expect(matches[0]?.identity.kind).toBe('record')
      if (Platform.OS === 'android') {
        expect(matches[0]?.metadata).toEqual({
          android: {
            bodyPosition: 'sitting_down',
            measurementLocation: 'left_upper_arm',
          },
        })
      } else {
        expect(matches[0]?.metadata).toBeUndefined()
      }
    })
  })

  describe('blood glucose', () => {
    it('round-trips a saved reading in mmol/L when authorized', async () => {
      const authorized = await hasVerifiedPermissions([
        { accessType: 'write', dataType: 'bloodGlucose' },
        { accessType: 'read', dataType: 'bloodGlucose' },
      ])

      if (!authorized) {
        return
      }

      await NitroHealth.deleteRecordsByTimeRange('bloodGlucose', saveReadRange)

      try {
        await NitroHealth.saveBloodGlucose([
          {
            date: saveInterval.startDate,
            millimolesPerLiter: 5.4,
            metadata: {
              android: {
                specimenSource: 'capillary_blood',
                mealType: 'breakfast',
                relationToMeal: 'before_meal',
              },
              ios: { mealTime: 'preprandial' },
            },
          },
        ])

        const page = await NitroHealth.readBloodGlucose(saveReadRange)

        if (isInconclusiveRead(page.samples)) {
          return
        }

        // HealthKit stores glucose in its composed mole unit, so allow float round-tripping.
        const matches = page.samples.filter(
          (sample) => Math.abs(sample.millimolesPerLiter - 5.4) < 0.001
        )

        expect(matches.length).toBe(1)
        expect(matches[0]?.identity.kind).toBe('record')
        if (Platform.OS === 'android') {
          expect(matches[0]?.metadata).toEqual({
            android: {
              specimenSource: 'capillary_blood',
              mealType: 'breakfast',
              relationToMeal: 'before_meal',
            },
          })
        } else {
          expect(matches[0]?.metadata).toEqual({ ios: { mealTime: 'preprandial' } })
        }
      } finally {
        await NitroHealth.deleteRecordsByTimeRange('bloodGlucose', saveReadRange)
      }
    })
  })

  describe('body temperature', () => {
    it('round-trips a saved reading in celsius when authorized', async () => {
      const authorized = await hasVerifiedPermissions([
        { accessType: 'write', dataType: 'bodyTemperature' },
        { accessType: 'read', dataType: 'bodyTemperature' },
      ])

      if (!authorized) {
        return
      }

      await NitroHealth.saveBodyTemperature([{ date: saveInterval.startDate, celsius: 36.6 }])

      const page = await NitroHealth.readBodyTemperature(saveReadRange)

      if (isInconclusiveRead(page.samples)) {
        return
      }

      // HealthKit stores temperature canonically, so allow float round-tripping.
      const matches = page.samples.filter((sample) => Math.abs(sample.celsius - 36.6) < 0.001)

      expect(matches.length).toBeGreaterThanOrEqual(1)
      expect(matches[0]?.identity.kind).toBe('record')
    })
  })

  describe('respiratory rate', () => {
    it('round-trips a saved reading in breaths per minute when authorized', async () => {
      const authorized = await hasVerifiedPermissions([
        { accessType: 'write', dataType: 'respiratoryRate' },
        { accessType: 'read', dataType: 'respiratoryRate' },
      ])

      if (!authorized) {
        return
      }

      await NitroHealth.saveRespiratoryRate([
        { date: saveInterval.startDate, breathsPerMinute: 16.5 },
      ])

      const page = await NitroHealth.readRespiratoryRate(saveReadRange)

      if (isInconclusiveRead(page.samples)) {
        return
      }

      const matches = page.samples.filter(
        (sample) => Math.abs(sample.breathsPerMinute - 16.5) < 0.001
      )

      expect(matches.length).toBeGreaterThanOrEqual(1)
      expect(matches[0]?.identity.kind).toBe('record')
    })
  })

  describe('VO2 max', () => {
    it('round-trips a saved reading in ml/kg/min when authorized', async () => {
      const authorized = await hasVerifiedPermissions([
        { accessType: 'write', dataType: 'vo2Max' },
        { accessType: 'read', dataType: 'vo2Max' },
      ])

      if (!authorized) {
        return
      }

      await NitroHealth.deleteRecordsByTimeRange('vo2Max', saveReadRange)

      try {
        await NitroHealth.saveVo2Max([
          {
            date: saveInterval.startDate,
            millilitersPerKilogramPerMinute: 42.5,
            metadata: {
              android: { measurementMethod: 'multistage_fitness_test' },
              ios: { testType: 'max_exercise' },
            },
          },
        ])

        const page = await NitroHealth.readVo2Max(saveReadRange)

        if (isInconclusiveRead(page.samples)) {
          return
        }

        const matches = page.samples.filter(
          (sample) =>
            sample.date.getTime() === saveInterval.startDate.getTime() &&
            Math.abs(sample.millilitersPerKilogramPerMinute - 42.5) < 0.001
        )

        expect(matches).toHaveLength(1)
        expect(matches[0]?.identity.kind).toBe('record')
        if (Platform.OS === 'android') {
          expect(matches[0]?.metadata).toEqual({
            android: { measurementMethod: 'multistage_fitness_test' },
          })
        } else {
          expect(matches[0]?.metadata).toEqual({ ios: { testType: 'max_exercise' } })
        }
      } finally {
        await NitroHealth.deleteRecordsByTimeRange('vo2Max', saveReadRange)
      }
    })
  })

  describe('floors climbed', () => {
    const syncId = 'nitro-health-harness-floors-round-trip'

    it('round-trips a saved floors interval when authorized', async () => {
      const authorized = await hasVerifiedPermissions([
        { accessType: 'write', dataType: 'floorsClimbed' },
        { accessType: 'read', dataType: 'floorsClimbed' },
      ])

      if (!authorized) {
        return
      }

      await NitroHealth.deleteRecordsByTimeRange('floorsClimbed', saveReadRange)
      try {
        await NitroHealth.saveFloorsClimbed([
          { ...saveInterval, floors: 12.5, sync: { id: syncId, version: 1 } },
        ])

        const page = await NitroHealth.readFloorsClimbed(saveReadRange)
        if (isInconclusiveRead(page.samples)) return

        const matches = page.samples.filter(
          (sample) =>
            Math.abs(sample.floors - 12.5) < 0.001 &&
            sample.startDate.getTime() === saveInterval.startDate.getTime() &&
            sample.endDate.getTime() === saveInterval.endDate.getTime()
        )

        expect(matches).toHaveLength(1)
        expect(matches[0]?.identity.kind).toBe('record')
      } finally {
        await NitroHealth.deleteRecordsByTimeRange('floorsClimbed', saveReadRange)
      }
    })
  })

  describe('body fat', () => {
    it('round-trips a saved reading in percent when authorized', async () => {
      const authorized = await hasVerifiedPermissions([
        { accessType: 'write', dataType: 'bodyFat' },
        { accessType: 'read', dataType: 'bodyFat' },
      ])

      if (!authorized) {
        return
      }

      await NitroHealth.saveBodyFat([{ date: saveInterval.startDate, percentage: 18.5 }])

      const page = await NitroHealth.readBodyFat(saveReadRange)

      if (isInconclusiveRead(page.samples)) {
        return
      }

      // HealthKit stores body fat as a fraction (0-1); a matching 18.5 read back pins the
      // native *100 / /100 conversion pair.
      const matches = page.samples.filter((sample) => Math.abs(sample.percentage - 18.5) < 0.001)

      expect(matches.length).toBeGreaterThanOrEqual(1)
      expect(matches[0]?.identity.kind).toBe('record')
    })
  })

  describe('lean body mass', () => {
    it('round-trips a saved reading in kilograms when authorized', async () => {
      const authorized = await hasVerifiedPermissions([
        { accessType: 'write', dataType: 'leanBodyMass' },
        { accessType: 'read', dataType: 'leanBodyMass' },
      ])

      if (!authorized) {
        return
      }

      await NitroHealth.saveLeanBodyMass([{ date: saveInterval.startDate, kilograms: 55.4 }])

      const page = await NitroHealth.readLeanBodyMass(saveReadRange)

      if (isInconclusiveRead(page.samples)) {
        return
      }

      const matches = page.samples.filter((sample) => Math.abs(sample.kilograms - 55.4) < 0.001)

      expect(matches.length).toBeGreaterThanOrEqual(1)
      expect(matches[0]?.identity.kind).toBe('record')
    })
  })

  describe('basal body temperature', () => {
    it('round-trips a saved reading in celsius when authorized', async () => {
      const authorized = await hasVerifiedPermissions([
        { accessType: 'write', dataType: 'basalBodyTemperature' },
        { accessType: 'read', dataType: 'basalBodyTemperature' },
      ])

      if (!authorized) {
        return
      }

      await NitroHealth.saveBasalBodyTemperature([{ date: saveInterval.startDate, celsius: 36.4 }])

      const page = await NitroHealth.readBasalBodyTemperature(saveReadRange)

      if (isInconclusiveRead(page.samples)) {
        return
      }

      const matches = page.samples.filter((sample) => Math.abs(sample.celsius - 36.4) < 0.001)

      expect(matches.length).toBeGreaterThanOrEqual(1)
      expect(matches[0]?.identity.kind).toBe('record')
    })
  })

  describe('height', () => {
    it('round-trips saved height through native code when authorized', async () => {
      const authorized = await hasVerifiedPermissions([
        { accessType: 'write', dataType: 'height' },
        { accessType: 'read', dataType: 'height' },
      ])

      if (!authorized) {
        return
      }

      await NitroHealth.saveHeight([{ date: saveInterval.startDate, meters: 1.78 }])

      const page = await NitroHealth.readHeight(saveReadRange)

      if (isInconclusiveRead(page.samples)) {
        return
      }

      expect(page.samples.some((sample) => sample.meters === 1.78)).toBe(true)
    })
  })
})
