import { mockNitroHealth } from './support/mockNitroHealth'

jest.mock('react-native-nitro-modules', () => ({
  NitroModules: {
    createHybridObject: jest.fn(() => mockNitroHealth),
  },
}))

import { NitroHealth } from 'react-native-nitro-health'

describe('NitroHealth save contract', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockNitroHealth.saveDistance.mockResolvedValue({ storedScope: 'walkingRunning' })
  })

  it('saves steps through the Nitro hybrid object', async () => {
    const startDate = new Date('2026-01-01T09:00:00.000Z')
    const endDate = new Date('2026-01-01T09:30:00.000Z')
    mockNitroHealth.saveSteps.mockResolvedValue(undefined)

    await expect(
      NitroHealth.saveSteps([{ startDate, endDate, count: 512 }])
    ).resolves.toBeUndefined()

    expect(mockNitroHealth.saveSteps).toHaveBeenCalledWith([
      {
        startTimeMs: startDate.getTime(),
        endTimeMs: endDate.getTime(),
        count: 512,
      },
    ])
  })

  it('saves distance through the Nitro hybrid object', async () => {
    const startDate = new Date('2026-01-01T09:00:00.000Z')
    const endDate = new Date('2026-01-01T09:30:00.000Z')
    mockNitroHealth.saveDistance.mockResolvedValue({ storedScope: 'activityUnspecified' })

    await expect(
      NitroHealth.saveDistance([
        { scope: 'walking-running', startDate, endDate, distanceMeters: 1250.5 },
      ])
    ).resolves.toEqual({ status: 'completed', storedScope: 'activity-unspecified' })

    expect(mockNitroHealth.saveDistance).toHaveBeenCalledWith([
      {
        startTimeMs: startDate.getTime(),
        endTimeMs: endDate.getTime(),
        distanceMeters: 1250.5,
        scope: 'walkingRunning',
      },
    ])
  })

  it('saves active energy burned through the Nitro hybrid object', async () => {
    const startDate = new Date('2026-01-01T09:00:00.000Z')
    const endDate = new Date('2026-01-01T09:30:00.000Z')
    mockNitroHealth.saveActiveEnergyBurned.mockResolvedValue(undefined)

    await expect(
      NitroHealth.saveActiveEnergyBurned([{ startDate, endDate, kilocalories: 215 }])
    ).resolves.toBeUndefined()

    expect(mockNitroHealth.saveActiveEnergyBurned).toHaveBeenCalledWith([
      {
        startTimeMs: startDate.getTime(),
        endTimeMs: endDate.getTime(),
        kilocalories: 215,
      },
    ])
  })

  it('saves heart rate through the Nitro hybrid object', async () => {
    const date = new Date('2026-01-01T09:00:00.000Z')
    mockNitroHealth.saveHeartRate.mockResolvedValue(undefined)

    await expect(NitroHealth.saveHeartRate([{ date, bpm: 72 }])).resolves.toBeUndefined()

    expect(mockNitroHealth.saveHeartRate).toHaveBeenCalledWith([
      {
        timeMs: date.getTime(),
        bpm: 72,
      },
    ])
  })

  it('saves body mass through the Nitro hybrid object', async () => {
    const date = new Date('2026-01-01T09:00:00.000Z')
    mockNitroHealth.saveBodyMass.mockResolvedValue(undefined)

    await expect(NitroHealth.saveBodyMass([{ date, kilograms: 72.5 }])).resolves.toBeUndefined()

    expect(mockNitroHealth.saveBodyMass).toHaveBeenCalledWith([
      {
        timeMs: date.getTime(),
        kilograms: 72.5,
      },
    ])
  })

  it('maps versioned sync identity for every writable sample type', async () => {
    const startDate = new Date('2026-01-01T09:00:00.000Z')
    const endDate = new Date('2026-01-01T09:30:00.000Z')
    const sync = { id: ' backend-record-42 ', version: 7 }
    const nativeSync = { syncId: sync.id, syncVersion: sync.version }

    await NitroHealth.saveSteps([{ startDate, endDate, count: 512, sync }])
    await NitroHealth.saveDistance([
      { scope: 'walking-running', startDate, endDate, distanceMeters: 1250.5, sync },
    ])
    await NitroHealth.saveActiveEnergyBurned([{ startDate, endDate, kilocalories: 215, sync }])
    await NitroHealth.saveHeartRate([{ date: startDate, bpm: 72, sync }])
    await NitroHealth.saveBloodPressure([
      { date: startDate, systolicMmHg: 118, diastolicMmHg: 76, sync },
    ])
    await NitroHealth.saveBloodGlucose([{ date: startDate, millimolesPerLiter: 5.4, sync }])
    await NitroHealth.saveBodyTemperature([{ date: startDate, celsius: 36.6, sync }])
    await NitroHealth.saveRespiratoryRate([{ date: startDate, breathsPerMinute: 16.5, sync }])
    await NitroHealth.saveBodyFat([{ date: startDate, percentage: 18.5, sync }])
    await NitroHealth.saveLeanBodyMass([{ date: startDate, kilograms: 55.4, sync }])
    await NitroHealth.saveBasalBodyTemperature([{ date: startDate, celsius: 36.4, sync }])
    await NitroHealth.saveBodyMass([{ date: startDate, kilograms: 72.5, sync }])
    await NitroHealth.saveRestingHeartRate([{ date: startDate, bpm: 58, sync }])
    await NitroHealth.saveOxygenSaturation([{ date: startDate, percentage: 97.5, sync }])
    await NitroHealth.saveHeight([{ date: startDate, meters: 1.78, sync }])

    expect(mockNitroHealth.saveSteps).toHaveBeenCalledWith([
      { startTimeMs: startDate.getTime(), endTimeMs: endDate.getTime(), count: 512, ...nativeSync },
    ])
    expect(mockNitroHealth.saveDistance).toHaveBeenCalledWith([
      {
        startTimeMs: startDate.getTime(),
        endTimeMs: endDate.getTime(),
        distanceMeters: 1250.5,
        scope: 'walkingRunning',
        ...nativeSync,
      },
    ])
    expect(mockNitroHealth.saveActiveEnergyBurned).toHaveBeenCalledWith([
      {
        startTimeMs: startDate.getTime(),
        endTimeMs: endDate.getTime(),
        kilocalories: 215,
        ...nativeSync,
      },
    ])
    expect(mockNitroHealth.saveHeartRate).toHaveBeenCalledWith([
      { timeMs: startDate.getTime(), bpm: 72, ...nativeSync },
    ])
    expect(mockNitroHealth.saveBloodPressure).toHaveBeenCalledWith([
      { timeMs: startDate.getTime(), systolicMmHg: 118, diastolicMmHg: 76, ...nativeSync },
    ])
    expect(mockNitroHealth.saveBloodGlucose).toHaveBeenCalledWith([
      { timeMs: startDate.getTime(), millimolesPerLiter: 5.4, ...nativeSync },
    ])
    expect(mockNitroHealth.saveBodyTemperature).toHaveBeenCalledWith([
      { timeMs: startDate.getTime(), celsius: 36.6, ...nativeSync },
    ])
    expect(mockNitroHealth.saveRespiratoryRate).toHaveBeenCalledWith([
      { timeMs: startDate.getTime(), breathsPerMinute: 16.5, ...nativeSync },
    ])
    expect(mockNitroHealth.saveBodyFat).toHaveBeenCalledWith([
      { timeMs: startDate.getTime(), percentage: 18.5, ...nativeSync },
    ])
    expect(mockNitroHealth.saveLeanBodyMass).toHaveBeenCalledWith([
      { timeMs: startDate.getTime(), kilograms: 55.4, ...nativeSync },
    ])
    expect(mockNitroHealth.saveBasalBodyTemperature).toHaveBeenCalledWith([
      { timeMs: startDate.getTime(), celsius: 36.4, ...nativeSync },
    ])
    expect(mockNitroHealth.saveBodyMass).toHaveBeenCalledWith([
      { timeMs: startDate.getTime(), kilograms: 72.5, ...nativeSync },
    ])
    expect(mockNitroHealth.saveRestingHeartRate).toHaveBeenCalledWith([
      { timeMs: startDate.getTime(), bpm: 58, ...nativeSync },
    ])
    expect(mockNitroHealth.saveOxygenSaturation).toHaveBeenCalledWith([
      { timeMs: startDate.getTime(), percentage: 97.5, ...nativeSync },
    ])
    expect(mockNitroHealth.saveHeight).toHaveBeenCalledWith([
      { timeMs: startDate.getTime(), meters: 1.78, ...nativeSync },
    ])
  })

  it('rejects invalid sync identity before crossing the native boundary', async () => {
    const startDate = new Date('2026-01-01T09:00:00.000Z')
    const endDate = new Date('2026-01-01T09:30:00.000Z')

    for (const sync of [null, 'record-1']) {
      await expect(
        NitroHealth.saveSteps([{ startDate, endDate, count: 100, sync: sync as never }])
      ).rejects.toThrow('samples[0]: sync must contain an id and version')
    }

    for (const id of ['', '  ']) {
      await expect(
        NitroHealth.saveSteps([{ startDate, endDate, count: 100, sync: { id, version: 0 } }])
      ).rejects.toThrow('samples[0]: sync.id must be a non-empty string')
    }

    await expect(
      NitroHealth.saveSteps([
        {
          startDate,
          endDate,
          count: 100,
          sync: { id: 42, version: 0 } as never,
        },
      ])
    ).rejects.toThrow('samples[0]: sync.id must be a non-empty string')

    for (const version of [
      -1,
      1.5,
      Number.NaN,
      Number.POSITIVE_INFINITY,
      Number.MAX_SAFE_INTEGER + 1,
    ]) {
      await expect(
        NitroHealth.saveSteps([
          { startDate, endDate, count: 100, sync: { id: 'record-1', version } },
        ])
      ).rejects.toThrow('samples[0]: sync.version must be a non-negative safe integer')
    }

    await expect(
      NitroHealth.saveSteps([
        {
          startDate,
          endDate,
          count: 100,
          sync: { id: 'record-1' } as never,
        },
      ])
    ).rejects.toThrow('samples[0]: sync.version must be a non-negative safe integer')

    expect(mockNitroHealth.saveSteps).not.toHaveBeenCalled()
  })

  it('rejects duplicate sync identities within one save call', async () => {
    const startDate = new Date('2026-01-01T09:00:00.000Z')
    const endDate = new Date('2026-01-01T09:30:00.000Z')

    await expect(
      NitroHealth.saveSteps([
        { startDate, endDate, count: 100, sync: { id: 'record-1', version: 0 } },
        { startDate, endDate, count: 200, sync: { id: 'record-1', version: 1 } },
      ])
    ).rejects.toThrow('samples[1]: sync.id duplicates samples[0].sync.id within this save call')

    expect(mockNitroHealth.saveSteps).not.toHaveBeenCalled()
  })

  it('allows keyed and unkeyed samples in one save call', async () => {
    const startDate = new Date('2026-01-01T09:00:00.000Z')
    const endDate = new Date('2026-01-01T09:30:00.000Z')

    await NitroHealth.saveSteps([
      { startDate, endDate, count: 100 },
      { startDate, endDate, count: 200, sync: { id: 'Record-A', version: 0 } },
      { startDate, endDate, count: 300, sync: { id: 'record-a', version: 0 } },
    ])

    expect(mockNitroHealth.saveSteps).toHaveBeenCalledWith([
      { startTimeMs: startDate.getTime(), endTimeMs: endDate.getTime(), count: 100 },
      {
        startTimeMs: startDate.getTime(),
        endTimeMs: endDate.getTime(),
        count: 200,
        syncId: 'Record-A',
        syncVersion: 0,
      },
      {
        startTimeMs: startDate.getTime(),
        endTimeMs: endDate.getTime(),
        count: 300,
        syncId: 'record-a',
        syncVersion: 0,
      },
    ])
  })

  it('rejects empty sample arrays before crossing the native boundary', async () => {
    await expect(NitroHealth.saveSteps([])).rejects.toThrow('At least one sample is required')
    await expect(NitroHealth.saveDistance([])).rejects.toThrow('At least one sample is required')
    await expect(NitroHealth.saveActiveEnergyBurned([])).rejects.toThrow(
      'At least one sample is required'
    )
    await expect(NitroHealth.saveHeartRate([])).rejects.toThrow('At least one sample is required')
    await expect(NitroHealth.saveBodyMass([])).rejects.toThrow('At least one sample is required')

    expect(mockNitroHealth.saveSteps).not.toHaveBeenCalled()
    expect(mockNitroHealth.saveDistance).not.toHaveBeenCalled()
    expect(mockNitroHealth.saveActiveEnergyBurned).not.toHaveBeenCalled()
    expect(mockNitroHealth.saveHeartRate).not.toHaveBeenCalled()
    expect(mockNitroHealth.saveBodyMass).not.toHaveBeenCalled()
  })

  it('requires walking-running scope for distance writes', async () => {
    const startDate = new Date('2026-01-01T09:00:00.000Z')
    const endDate = new Date('2026-01-01T09:30:00.000Z')

    await expect(
      NitroHealth.saveDistance([{ startDate, endDate, distanceMeters: 5 } as never])
    ).rejects.toThrow('samples[0]: scope must be walking-running')
    await expect(
      NitroHealth.saveDistance([
        { scope: 'activity-unspecified', startDate, endDate, distanceMeters: 5 } as never,
      ])
    ).rejects.toThrow('samples[0]: scope must be walking-running')

    expect(mockNitroHealth.saveDistance).not.toHaveBeenCalled()
  })

  it('rejects invalid interval sample dates before crossing the native boundary', async () => {
    const endDate = new Date('2026-01-01T09:30:00.000Z')

    await expect(
      NitroHealth.saveSteps([{ startDate: new Date(Number.NaN), endDate, count: 100 }])
    ).rejects.toThrow('samples[0]: a valid startDate is required')
    await expect(
      NitroHealth.saveDistance([
        {
          startDate: new Date('2026-01-01T09:00:00.000Z'),
          endDate: new Date(Number.NaN),
          distanceMeters: 5,
          scope: 'walking-running',
        },
      ])
    ).rejects.toThrow('samples[0]: a valid endDate is required')
    await expect(
      NitroHealth.saveActiveEnergyBurned([
        { startDate: new Date(Number.NaN), endDate, kilocalories: 10 },
      ])
    ).rejects.toThrow('samples[0]: a valid startDate is required')

    expect(mockNitroHealth.saveSteps).not.toHaveBeenCalled()
    expect(mockNitroHealth.saveDistance).not.toHaveBeenCalled()
    expect(mockNitroHealth.saveActiveEnergyBurned).not.toHaveBeenCalled()
  })

  it('rejects inverted or empty sample intervals before crossing the native boundary', async () => {
    const startDate = new Date('2026-01-01T09:30:00.000Z')
    const endDate = new Date('2026-01-01T09:00:00.000Z')

    await expect(NitroHealth.saveSteps([{ startDate, endDate, count: 100 }])).rejects.toThrow(
      'samples[0]: startDate must be before endDate'
    )
    await expect(
      NitroHealth.saveSteps([{ startDate, endDate: startDate, count: 100 }])
    ).rejects.toThrow('samples[0]: startDate must be before endDate')

    expect(mockNitroHealth.saveSteps).not.toHaveBeenCalled()
  })

  it('rejects invalid point-in-time sample dates before crossing the native boundary', async () => {
    await expect(
      NitroHealth.saveHeartRate([{ date: new Date(Number.NaN), bpm: 72 }])
    ).rejects.toThrow('samples[0]: a valid date is required')
    await expect(
      NitroHealth.saveBodyMass([{ date: new Date(Number.NaN), kilograms: 72.5 }])
    ).rejects.toThrow('samples[0]: a valid date is required')

    expect(mockNitroHealth.saveHeartRate).not.toHaveBeenCalled()
    expect(mockNitroHealth.saveBodyMass).not.toHaveBeenCalled()
  })

  it('rejects invalid sample values before crossing the native boundary', async () => {
    const startDate = new Date('2026-01-01T09:00:00.000Z')
    const endDate = new Date('2026-01-01T09:30:00.000Z')
    const date = startDate

    for (const count of [0, -1, 1.5, Number.NaN]) {
      await expect(NitroHealth.saveSteps([{ startDate, endDate, count }])).rejects.toThrow(
        'samples[0]: count must be a positive integer'
      )
    }
    for (const distanceMeters of [-1, Number.NaN, Number.POSITIVE_INFINITY]) {
      await expect(
        NitroHealth.saveDistance([{ scope: 'walking-running', startDate, endDate, distanceMeters }])
      ).rejects.toThrow('samples[0]: distanceMeters must be a non-negative number')
    }
    for (const kilocalories of [-1, Number.NaN, Number.POSITIVE_INFINITY]) {
      await expect(
        NitroHealth.saveActiveEnergyBurned([{ startDate, endDate, kilocalories }])
      ).rejects.toThrow('samples[0]: kilocalories must be a non-negative number')
    }
    for (const bpm of [0, -1, 0.5, 301, Number.NaN, Number.POSITIVE_INFINITY]) {
      await expect(NitroHealth.saveHeartRate([{ date, bpm }])).rejects.toThrow(
        'samples[0]: bpm must be between 1 and 300'
      )
    }
    for (const kilograms of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
      await expect(NitroHealth.saveBodyMass([{ date, kilograms }])).rejects.toThrow(
        'samples[0]: kilograms must be greater than 0'
      )
    }

    expect(mockNitroHealth.saveSteps).not.toHaveBeenCalled()
    expect(mockNitroHealth.saveDistance).not.toHaveBeenCalled()
    expect(mockNitroHealth.saveActiveEnergyBurned).not.toHaveBeenCalled()
    expect(mockNitroHealth.saveHeartRate).not.toHaveBeenCalled()
    expect(mockNitroHealth.saveBodyMass).not.toHaveBeenCalled()
  })

  // Health Connect rejects values above these caps on Android; the wrapper enforces them on
  // both platforms so behavior stays identical.
  it('rejects sample values above the Health Connect caps before crossing the native boundary', async () => {
    const startDate = new Date('2026-01-01T09:00:00.000Z')
    const endDate = new Date('2026-01-01T09:30:00.000Z')
    const date = startDate

    await expect(NitroHealth.saveSteps([{ startDate, endDate, count: 1_000_001 }])).rejects.toThrow(
      'samples[0]: count must not exceed 1000000'
    )
    await expect(
      NitroHealth.saveDistance([
        {
          scope: 'walking-running',
          startDate,
          endDate,
          distanceMeters: 1_000_000.5,
        },
      ])
    ).rejects.toThrow('samples[0]: distanceMeters must not exceed 1000000')
    await expect(
      NitroHealth.saveActiveEnergyBurned([{ startDate, endDate, kilocalories: 1_000_001 }])
    ).rejects.toThrow('samples[0]: kilocalories must not exceed 1000000')
    await expect(NitroHealth.saveBodyMass([{ date, kilograms: 1_000.5 }])).rejects.toThrow(
      'samples[0]: kilograms must not exceed 1000'
    )

    expect(mockNitroHealth.saveSteps).not.toHaveBeenCalled()
    expect(mockNitroHealth.saveDistance).not.toHaveBeenCalled()
    expect(mockNitroHealth.saveActiveEnergyBurned).not.toHaveBeenCalled()
    expect(mockNitroHealth.saveHeartRate).not.toHaveBeenCalled()
    expect(mockNitroHealth.saveBodyMass).not.toHaveBeenCalled()
  })

  it('reports the failing sample index in validation errors', async () => {
    const startDate = new Date('2026-01-01T09:00:00.000Z')
    const endDate = new Date('2026-01-01T09:30:00.000Z')

    await expect(
      NitroHealth.saveSteps([
        { startDate, endDate, count: 100 },
        { startDate, endDate, count: -5 },
      ])
    ).rejects.toThrow('samples[1]: count must be a positive integer')

    expect(mockNitroHealth.saveSteps).not.toHaveBeenCalled()
  })

  it('propagates native save rejections', async () => {
    const startDate = new Date('2026-01-01T09:00:00.000Z')
    const endDate = new Date('2026-01-01T09:30:00.000Z')
    mockNitroHealth.saveSteps.mockRejectedValue(new Error('Missing permission to write steps'))

    await expect(NitroHealth.saveSteps([{ startDate, endDate, count: 100 }])).rejects.toThrow(
      'Missing permission to write steps'
    )
  })
})
