import {
  NitroHealth,
  createNitroHealthMock,
  resetNitroHealthMock,
} from 'react-native-nitro-health/jest/mock'

const range = {
  startDate: new Date('2026-01-01T00:00:00.000Z'),
  endDate: new Date('2026-01-02T00:00:00.000Z'),
}
const interval = {
  startDate: new Date('2026-01-01T10:00:00.000Z'),
  endDate: new Date('2026-01-01T11:00:00.000Z'),
}
const instant = new Date('2026-01-01T12:00:00.000Z')
const origin = {
  identifier: 'react-native-nitro-health.mock',
  displayName: 'Nitro Health Jest Mock',
}

describe('NitroHealth Jest mock', () => {
  beforeEach(() => {
    resetNitroHealthMock()
  })

  it('uses polling availability and unknown recording method defaults', async () => {
    expect(NitroHealth.getAvailability()).toEqual({ status: 'available' })
    await expect(NitroHealth.getCapabilities()).resolves.toEqual({
      status: 'available',
      backgroundChanges: {
        mode: 'polling',
        scheduling: 'app-owned',
        backgroundRead: 'not-granted',
      },
      historyRead: 'not-granted',
    })

    await expect(NitroHealth.saveSteps([{ ...interval, count: 100 }])).resolves.toEqual({
      status: 'completed',
      storedRecordingMethods: ['unknown'],
    })
    await expect(NitroHealth.readSteps(range)).resolves.toEqual({
      samples: [
        {
          identity: { kind: 'record', id: 'mock-steps-1' },
          origin,
          recordingMethod: 'unknown',
          ...interval,
          count: 100,
        },
      ],
    })
  })

  it('retains all four Android recording methods in mixed batch order', async () => {
    const samples = [
      { ...interval, count: 1, recordingMethod: 'automatically-recorded' as const },
      { ...interval, count: 2, recordingMethod: 'manual' as const },
      { ...interval, count: 3, recordingMethod: 'unknown' as const },
      { ...interval, count: 4, recordingMethod: 'actively-recorded' as const },
    ]

    await expect(NitroHealth.saveSteps(samples)).resolves.toEqual({
      status: 'completed',
      storedRecordingMethods: ['automatically-recorded', 'manual', 'unknown', 'actively-recorded'],
    })
    const page = await NitroHealth.readSteps(range)
    expect(page.samples.map(({ count }) => count)).toEqual([1, 2, 3, 4])
    expect(page.samples.map(({ recordingMethod }) => recordingMethod)).toEqual([
      'automatically-recorded',
      'manual',
      'unknown',
      'actively-recorded',
    ])
  })

  it('persists every regular writable sample type with public read fields', async () => {
    const saveResults = await Promise.all([
      NitroHealth.saveActiveEnergyBurned([{ ...interval, kilocalories: 120 }]),
      NitroHealth.saveHydration([{ ...interval, milliliters: 500 }]),
      NitroHealth.saveFloorsClimbed([{ ...interval, floors: 4 }]),
      NitroHealth.saveBodyMass([{ date: instant, kilograms: 75 }]),
      NitroHealth.saveHeartRate([{ date: instant, bpm: 70 }]),
      NitroHealth.saveBloodPressure([{ date: instant, systolicMmHg: 120, diastolicMmHg: 80 }]),
      NitroHealth.saveBloodGlucose([{ date: instant, millimolesPerLiter: 5.2 }]),
      NitroHealth.saveBodyTemperature([{ date: instant, celsius: 36.8 }]),
      NitroHealth.saveRespiratoryRate([{ date: instant, breathsPerMinute: 14 }]),
      NitroHealth.saveBodyFat([{ date: instant, percentage: 20 }]),
      NitroHealth.saveLeanBodyMass([{ date: instant, kilograms: 60 }]),
      NitroHealth.saveBasalBodyTemperature([{ date: instant, celsius: 36.5 }]),
      NitroHealth.saveRestingHeartRate([{ date: instant, bpm: 62 }]),
      NitroHealth.saveOxygenSaturation([{ date: instant, percentage: 98 }]),
      NitroHealth.saveHeight([{ date: instant, meters: 1.8 }]),
      NitroHealth.saveVo2Max([{ date: instant, millilitersPerKilogramPerMinute: 42 }]),
    ])
    expect(saveResults).toEqual(
      Array.from({ length: saveResults.length }, () => ({
        status: 'completed',
        storedRecordingMethods: ['unknown'],
      }))
    )

    const pages = await Promise.all([
      NitroHealth.readActiveEnergyBurned(range),
      NitroHealth.readHydration(range),
      NitroHealth.readFloorsClimbed(range),
      NitroHealth.readBodyMass(range),
      NitroHealth.readHeartRate(range),
      NitroHealth.readBloodPressure(range),
      NitroHealth.readBloodGlucose(range),
      NitroHealth.readBodyTemperature(range),
      NitroHealth.readRespiratoryRate(range),
      NitroHealth.readBodyFat(range),
      NitroHealth.readLeanBodyMass(range),
      NitroHealth.readBasalBodyTemperature(range),
      NitroHealth.readRestingHeartRate(range),
      NitroHealth.readOxygenSaturation(range),
      NitroHealth.readHeight(range),
      NitroHealth.readVo2Max(range),
    ])
    const expectedValues = [
      { ...interval, kilocalories: 120 },
      { ...interval, milliliters: 500 },
      { ...interval, floors: 4 },
      { startDate: instant, endDate: instant, kilograms: 75 },
      { date: instant, bpm: 70 },
      { date: instant, systolicMmHg: 120, diastolicMmHg: 80 },
      { date: instant, millimolesPerLiter: 5.2 },
      { date: instant, celsius: 36.8 },
      { date: instant, breathsPerMinute: 14 },
      { date: instant, percentage: 20 },
      { date: instant, kilograms: 60 },
      { date: instant, celsius: 36.5 },
      { date: instant, bpm: 62 },
      { date: instant, percentage: 98 },
      { date: instant, meters: 1.8 },
      { date: instant, millilitersPerKilogramPerMinute: 42 },
    ]

    pages.forEach((page, index) => {
      const expectedValue = expectedValues[index]
      if (expectedValue === undefined) throw new Error(`Missing expected value at index ${index}`)
      expect(page.samples).toHaveLength(1)
      expect(page.samples[0]).toEqual(
        expect.objectContaining({
          identity: expect.objectContaining({
            kind: index === 4 ? 'record-child' : 'record',
          }),
          origin,
          recordingMethod: 'unknown',
          ...expectedValue,
        })
      )
    })
  })

  it('degrades iOS active, automatic, unknown, and omitted methods while retaining manual', async () => {
    const observer = createNitroHealthMock({ profile: 'observer' })
    const samples = [
      { date: instant, bpm: 61, recordingMethod: 'manual' as const },
      { date: instant, bpm: 62, recordingMethod: 'actively-recorded' as const },
      { date: instant, bpm: 63, recordingMethod: 'automatically-recorded' as const },
      { date: instant, bpm: 64, recordingMethod: 'unknown' as const },
      { date: instant, bpm: 65 },
    ]

    await expect(observer.saveRestingHeartRate(samples)).resolves.toEqual({
      status: 'completed',
      storedRecordingMethods: ['manual', 'unknown', 'unknown', 'unknown', 'unknown'],
    })
    const page = await observer.readRestingHeartRate(range)
    expect(page.samples.map(({ recordingMethod }) => recordingMethod)).toEqual([
      'manual',
      'unknown',
      'unknown',
      'unknown',
      'unknown',
    ])
    expect(NitroHealth.readRestingHeartRate).not.toHaveBeenCalled()
  })

  it('returns profile-specific distance results and readback scopes', async () => {
    const observer = createNitroHealthMock({ profile: 'observer' })
    const samples = [
      {
        ...interval,
        scope: 'walking-running' as const,
        distanceMeters: 1000,
        recordingMethod: 'actively-recorded' as const,
      },
    ]

    await expect(NitroHealth.saveDistance(samples)).resolves.toEqual({
      status: 'completed',
      storedRecordingMethods: ['actively-recorded'],
      storedScope: 'activity-unspecified',
    })
    await expect(observer.saveDistance(samples)).resolves.toEqual({
      status: 'completed',
      storedRecordingMethods: ['unknown'],
      storedScope: 'walking-running',
    })
    expect((await NitroHealth.readDistance(range)).samples[0]).toEqual(
      expect.objectContaining({
        recordingMethod: 'actively-recorded',
        scope: 'activity-unspecified',
        distanceMeters: 1000,
      })
    )
    expect((await observer.readDistance(range)).samples[0]).toEqual(
      expect.objectContaining({
        recordingMethod: 'unknown',
        scope: 'walking-running',
        distanceMeters: 1000,
      })
    )
  })

  it('stores one public sleep envelope per session with aligned methods', async () => {
    const sessions = [
      {
        ...interval,
        recordingMethod: 'manual' as const,
        stages: [{ ...interval, stage: 'asleepDeep' as const }],
      },
      {
        startDate: new Date('2026-01-01T12:00:00.000Z'),
        endDate: new Date('2026-01-01T13:00:00.000Z'),
        recordingMethod: 'automatically-recorded' as const,
      },
    ]

    await expect(NitroHealth.saveSleepSessions(sessions)).resolves.toEqual({
      status: 'completed',
      storedRecordingMethods: ['manual', 'automatically-recorded'],
    })
    const page = await NitroHealth.readSleepSamples(range)
    expect(page.samples).toHaveLength(2)
    expect(page.samples[0]).toEqual(
      expect.objectContaining({
        kind: 'session-envelope',
        stageData: 'reported',
        recordingMethod: 'manual',
      })
    )
    expect(page.samples[1]).toEqual(
      expect.objectContaining({
        kind: 'session-envelope',
        stageData: 'not-reported',
        recordingMethod: 'automatically-recorded',
      })
    )
  })

  it('returns a one-entry workout result and a valid public workout', async () => {
    const workout = {
      ...interval,
      activityType: 'running' as const,
      displayName: 'Mock run',
      recordingMethod: 'manual' as const,
    }

    await expect(NitroHealth.saveWorkout(workout)).resolves.toEqual({
      status: 'completed',
      storedRecordingMethods: ['manual'],
    })
    await expect(NitroHealth.readWorkouts(range)).resolves.toEqual({
      samples: [
        {
          identity: { kind: 'record', id: 'mock-workout-1' },
          origin,
          recordingMethod: 'manual',
          ...interval,
          elapsedDurationSeconds: 3600,
          activeDuration: { status: 'not-reported' },
          activity: {
            status: 'known',
            type: 'running',
            portability: 'portable',
            mapping: 'exact',
          },
          title: 'Mock run',
          totalDistance: { status: 'not-reported' },
          totalActiveEnergyBurned: { status: 'not-reported' },
        },
      ],
    })
  })

  it('uses the iOS workout label field in the observer profile', async () => {
    const observer = createNitroHealthMock({ profile: 'observer' })

    await observer.saveWorkout({
      ...interval,
      activityType: 'running',
      displayName: 'Observer run',
    })

    const saved = (await observer.readWorkouts(range)).samples[0]
    expect(saved?.title).toBeUndefined()
    expect(saved?.brandName).toBe('Observer run')
  })

  it('isolates created mocks and reset replaces the shared closure state', async () => {
    const first = createNitroHealthMock()
    const second = createNitroHealthMock()
    await first.saveSteps([{ ...interval, count: 5 }])

    expect((await first.readSteps(range)).samples).toHaveLength(1)
    expect((await second.readSteps(range)).samples).toHaveLength(0)
    expect((await NitroHealth.readSteps(range)).samples).toHaveLength(0)

    await NitroHealth.saveSteps([{ ...interval, count: 6 }])
    resetNitroHealthMock()
    expect((await NitroHealth.readSteps(range)).samples).toHaveLength(0)
    await expect(NitroHealth.saveSteps([{ ...interval, count: 7 }])).resolves.toEqual({
      status: 'completed',
      storedRecordingMethods: ['unknown'],
    })
    expect((await NitroHealth.readSteps(range)).samples[0]?.identity).toEqual({
      kind: 'record',
      id: 'mock-steps-1',
    })
  })

  it('keeps page shape, pagination, ordering, and coarse range filtering', async () => {
    await NitroHealth.saveSteps([
      { ...interval, count: 1 },
      {
        startDate: new Date('2026-01-03T10:00:00.000Z'),
        endDate: new Date('2026-01-03T11:00:00.000Z'),
        count: 2,
      },
      { ...interval, count: 3 },
    ])

    const firstPage = await NitroHealth.readSteps({ ...range, ascending: false, limit: 1 })
    expect(firstPage.samples.map(({ count }) => count)).toEqual([1])
    expect(firstPage.nextCursor).toBe('mock:1')
    const cursor = firstPage.nextCursor
    if (cursor === undefined) throw new Error('Expected a pagination cursor')
    await expect(
      NitroHealth.readSteps({ ...range, ascending: false, limit: 1, cursor })
    ).resolves.toEqual({
      samples: [expect.objectContaining({ count: 3 })],
    })
  })

  it('preserves observer and unavailable profile availability behavior', async () => {
    const observer = createNitroHealthMock({ profile: 'observer' })
    const unavailable = createNitroHealthMock({ profile: 'unavailable' })

    await expect(observer.getCapabilities()).resolves.toEqual({
      status: 'available',
      backgroundChanges: {
        mode: 'observer',
        frequencies: ['immediate', 'hourly', 'daily', 'weekly'],
        backgroundRead: 'included',
      },
      historyRead: 'included',
    })
    expect(unavailable.getAvailability()).toEqual({
      status: 'unavailable',
      reason: 'not-supported',
    })
    await expect(unavailable.saveSteps([{ ...interval, count: 1 }])).rejects.toThrow(
      'Health data is not available'
    )
  })

  it('rejects empty writes like the public facade', async () => {
    await expect(NitroHealth.saveSteps([])).rejects.toThrow('At least one sample is required')
    await expect(NitroHealth.saveSleepSessions([])).rejects.toThrow(
      'At least one sleep session is required'
    )
  })
})
