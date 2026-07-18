const mockNitroHealth = {
  saveActiveEnergyBurned: jest.fn(),
  saveBodyMass: jest.fn(),
  saveDistance: jest.fn(),
  saveHeartRate: jest.fn(),
  saveSteps: jest.fn(),
}

jest.mock('react-native-nitro-modules', () => ({
  NitroModules: {
    createHybridObject: jest.fn(() => mockNitroHealth),
  },
}))

const { NitroHealth } = require('react-native-nitro-health')

describe('NitroHealth save contract', () => {
  beforeEach(() => {
    jest.clearAllMocks()
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
    mockNitroHealth.saveDistance.mockResolvedValue(undefined)

    await expect(
      NitroHealth.saveDistance([{ startDate, endDate, distanceMeters: 1250.5 }])
    ).resolves.toBeUndefined()

    expect(mockNitroHealth.saveDistance).toHaveBeenCalledWith([
      {
        startTimeMs: startDate.getTime(),
        endTimeMs: endDate.getTime(),
        distanceMeters: 1250.5,
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
        NitroHealth.saveDistance([{ startDate, endDate, distanceMeters }])
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
      NitroHealth.saveDistance([{ startDate, endDate, distanceMeters: 1_000_000.5 }])
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
