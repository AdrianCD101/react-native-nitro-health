import { mockNitroHealth } from './support/mockNitroHealth'

jest.mock('react-native-nitro-modules', () => ({
  NitroModules: {
    createHybridObject: jest.fn(() => mockNitroHealth),
  },
}))

import { NitroHealth } from 'react-native-nitro-health'

const emptyWriteMetadata = {
  provenance: {
    deviceType: undefined,
    deviceManufacturer: undefined,
    deviceModel: undefined,
    recordingMethod: undefined,
  },
}

describe('NitroHealth save contract', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockNitroHealth.saveSteps.mockImplementation(async (samples) => ({
      storedRecordingMethods: samples.map(() => 'unknown'),
    }))
    mockNitroHealth.saveDistance.mockResolvedValue({
      storedScope: 'walkingRunning',
      storedRecordingMethods: ['unknown'],
    })
  })

  it('saves steps through the Nitro hybrid object', async () => {
    const startDate = new Date('2026-01-01T09:00:00.000Z')
    const endDate = new Date('2026-01-01T09:30:00.000Z')
    mockNitroHealth.saveSteps.mockResolvedValue({ storedRecordingMethods: ['unknown'] })

    await expect(NitroHealth.saveSteps([{ startDate, endDate, count: 512 }])).resolves.toEqual({
      status: 'completed',
      storedRecordingMethods: ['unknown'],
    })

    expect(mockNitroHealth.saveSteps).toHaveBeenCalledWith([
      {
        startTimeMs: startDate.getTime(),
        endTimeMs: endDate.getTime(),
        count: 512,
        writeMetadata: emptyWriteMetadata,
      },
    ])
  })

  it('maps mixed recording methods in input order and trusts the native stored methods', async () => {
    const startDate = new Date('2026-01-01T09:00:00.000Z')
    const endDate = new Date('2026-01-01T09:30:00.000Z')
    mockNitroHealth.saveSteps.mockResolvedValue({
      storedRecordingMethods: ['automaticallyRecorded', 'unknown', 'manual'],
    })

    await expect(
      NitroHealth.saveSteps([
        { startDate, endDate, count: 100, recordingMethod: 'manual' },
        { startDate, endDate, count: 200 },
        { startDate, endDate, count: 300, recordingMethod: 'actively-recorded' },
      ])
    ).resolves.toEqual({
      status: 'completed',
      storedRecordingMethods: ['automatically-recorded', 'unknown', 'manual'],
    })

    expect(mockNitroHealth.saveSteps).toHaveBeenCalledWith([
      {
        startTimeMs: startDate.getTime(),
        endTimeMs: endDate.getTime(),
        count: 100,
        writeMetadata: {
          provenance: {
            deviceType: undefined,
            deviceManufacturer: undefined,
            deviceModel: undefined,
            recordingMethod: 'manual',
          },
        },
      },
      {
        startTimeMs: startDate.getTime(),
        endTimeMs: endDate.getTime(),
        count: 200,
        writeMetadata: emptyWriteMetadata,
      },
      {
        startTimeMs: startDate.getTime(),
        endTimeMs: endDate.getTime(),
        count: 300,
        writeMetadata: {
          provenance: {
            deviceType: undefined,
            deviceManufacturer: undefined,
            deviceModel: undefined,
            recordingMethod: 'activelyRecorded',
          },
        },
      },
    ])
    expect(mockNitroHealth.saveSteps.mock.calls[0]?.[0][1]).toHaveProperty(
      'writeMetadata.provenance.recordingMethod',
      undefined
    )
  })

  it('rejects a native write result that is not aligned with its inputs', async () => {
    const startDate = new Date('2026-01-01T09:00:00.000Z')
    const endDate = new Date('2026-01-01T09:30:00.000Z')
    mockNitroHealth.saveSteps.mockResolvedValueOnce({ storedRecordingMethods: [] })

    await expect(NitroHealth.saveSteps([{ startDate, endDate, count: 100 }])).rejects.toThrow(
      'Native write returned 0 recording methods for 1 inputs'
    )
  })

  it('reports the index of an unsupported recording method', async () => {
    const startDate = new Date('2026-01-01T09:00:00.000Z')
    const endDate = new Date('2026-01-01T09:30:00.000Z')

    await expect(
      NitroHealth.saveSteps([
        { startDate, endDate, count: 100 },
        { startDate, endDate, count: 200, recordingMethod: 'invalid' as never },
      ])
    ).rejects.toThrow("samples[1]: unsupported recording method 'invalid'")
    expect(mockNitroHealth.saveSteps).not.toHaveBeenCalled()
  })

  it('maps writable device provenance and every portable device type', async () => {
    const startDate = new Date('2026-01-01T09:00:00.000Z')
    const endDate = new Date('2026-01-01T09:30:00.000Z')
    const mappings = [
      ['unknown', 'unknown'],
      ['watch', 'watch'],
      ['phone', 'phone'],
      ['scale', 'scale'],
      ['ring', 'ring'],
      ['head-mounted', 'headMounted'],
      ['fitness-band', 'fitnessBand'],
      ['chest-strap', 'chestStrap'],
      ['smart-display', 'smartDisplay'],
    ] as const

    await NitroHealth.saveSteps(
      mappings.map(([type], index) => ({
        startDate,
        endDate,
        count: index + 1,
        device: { type, manufacturer: 'Example', model: 'Sensor' },
      }))
    )

    expect(
      mockNitroHealth.saveSteps.mock.calls[0]?.[0].map(
        ({ writeMetadata }) => writeMetadata.provenance
      )
    ).toEqual(
      mappings.map(([, deviceType]) => ({
        deviceType,
        deviceManufacturer: 'Example',
        deviceModel: 'Sensor',
        recordingMethod: undefined,
      }))
    )
  })

  it('rejects malformed writable device provenance before crossing native', async () => {
    const startDate = new Date('2026-01-01T09:00:00.000Z')
    const endDate = new Date('2026-01-01T09:30:00.000Z')
    const save = (device: unknown) =>
      NitroHealth.saveSteps([{ startDate, endDate, count: 100, device } as never])

    await expect(save(null)).rejects.toThrow('samples[0]: device must be an object')
    await expect(save([])).rejects.toThrow('samples[0]: device must be an object')
    await expect(save({ type: 'thermometer' })).rejects.toThrow(
      "samples[0]: unsupported device type 'thermometer'"
    )
    await expect(save({ manufacturer: '  ' })).rejects.toThrow(
      'samples[0]: device.manufacturer must be a non-empty string'
    )
    await expect(save({ serialNumber: 'secret' })).rejects.toThrow(
      'samples[0]: device.serialNumber is unsupported'
    )
    expect(mockNitroHealth.saveSteps).not.toHaveBeenCalled()
  })

  it('normalizes an empty writable device to omission', async () => {
    const startDate = new Date('2026-01-01T09:00:00.000Z')
    const endDate = new Date('2026-01-01T09:30:00.000Z')

    await NitroHealth.saveSteps([{ startDate, endDate, count: 100, device: {} }])

    expect(mockNitroHealth.saveSteps.mock.calls[0]?.[0][0]?.writeMetadata.provenance).toEqual(
      emptyWriteMetadata.provenance
    )
  })

  it('saves distance through the Nitro hybrid object', async () => {
    const startDate = new Date('2026-01-01T09:00:00.000Z')
    const endDate = new Date('2026-01-01T09:30:00.000Z')
    mockNitroHealth.saveDistance.mockResolvedValue({
      storedScope: 'activityUnspecified',
      storedRecordingMethods: ['activelyRecorded'],
    })

    await expect(
      NitroHealth.saveDistance([
        {
          scope: 'walking-running',
          startDate,
          endDate,
          distanceMeters: 1250.5,
          recordingMethod: 'automatically-recorded',
        },
      ])
    ).resolves.toEqual({
      status: 'completed',
      storedScope: 'activity-unspecified',
      storedRecordingMethods: ['actively-recorded'],
    })

    expect(mockNitroHealth.saveDistance).toHaveBeenCalledWith([
      {
        startTimeMs: startDate.getTime(),
        endTimeMs: endDate.getTime(),
        distanceMeters: 1250.5,
        scope: 'walkingRunning',
        writeMetadata: {
          provenance: {
            deviceType: undefined,
            deviceManufacturer: undefined,
            deviceModel: undefined,
            recordingMethod: 'automaticallyRecorded',
          },
        },
      },
    ])
  })

  it('saves active energy burned through the Nitro hybrid object', async () => {
    const startDate = new Date('2026-01-01T09:00:00.000Z')
    const endDate = new Date('2026-01-01T09:30:00.000Z')
    mockNitroHealth.saveActiveEnergyBurned.mockResolvedValue({
      storedRecordingMethods: ['unknown'],
    })

    await expect(
      NitroHealth.saveActiveEnergyBurned([{ startDate, endDate, kilocalories: 215 }])
    ).resolves.toEqual({ status: 'completed', storedRecordingMethods: ['unknown'] })

    expect(mockNitroHealth.saveActiveEnergyBurned).toHaveBeenCalledWith([
      {
        startTimeMs: startDate.getTime(),
        endTimeMs: endDate.getTime(),
        kilocalories: 215,
        writeMetadata: emptyWriteMetadata,
      },
    ])
  })

  it('saves hydration through the Nitro hybrid object', async () => {
    const startDate = new Date('2026-01-01T09:00:00.000Z')
    const endDate = new Date('2026-01-01T09:30:00.000Z')
    mockNitroHealth.saveHydration.mockResolvedValue({ storedRecordingMethods: ['unknown'] })

    await expect(
      NitroHealth.saveHydration([{ startDate, endDate, milliliters: 250.5 }])
    ).resolves.toEqual({ status: 'completed', storedRecordingMethods: ['unknown'] })

    expect(mockNitroHealth.saveHydration).toHaveBeenCalledWith([
      {
        startTimeMs: startDate.getTime(),
        endTimeMs: endDate.getTime(),
        milliliters: 250.5,
        writeMetadata: emptyWriteMetadata,
      },
    ])
  })

  it('saves floors climbed through the Nitro hybrid object', async () => {
    const startDate = new Date('2026-01-01T09:00:00.000Z')
    const endDate = new Date('2026-01-01T09:30:00.000Z')
    mockNitroHealth.saveFloorsClimbed.mockResolvedValue({ storedRecordingMethods: ['unknown'] })

    await expect(
      NitroHealth.saveFloorsClimbed([{ startDate, endDate, floors: 12.5 }])
    ).resolves.toEqual({ status: 'completed', storedRecordingMethods: ['unknown'] })

    expect(mockNitroHealth.saveFloorsClimbed).toHaveBeenCalledWith([
      {
        startTimeMs: startDate.getTime(),
        endTimeMs: endDate.getTime(),
        floors: 12.5,
        writeMetadata: emptyWriteMetadata,
      },
    ])
  })

  it('saves heart rate through the Nitro hybrid object', async () => {
    const date = new Date('2026-01-01T09:00:00.000Z')
    mockNitroHealth.saveHeartRate.mockResolvedValue({ storedRecordingMethods: ['unknown'] })

    await expect(NitroHealth.saveHeartRate([{ date, bpm: 72 }])).resolves.toEqual({
      status: 'completed',
      storedRecordingMethods: ['unknown'],
    })

    expect(mockNitroHealth.saveHeartRate).toHaveBeenCalledWith([
      {
        timeMs: date.getTime(),
        bpm: 72,
        writeMetadata: emptyWriteMetadata,
      },
    ])
  })

  it('saves body mass through the Nitro hybrid object', async () => {
    const date = new Date('2026-01-01T09:00:00.000Z')
    mockNitroHealth.saveBodyMass.mockResolvedValue({ storedRecordingMethods: ['unknown'] })

    await expect(NitroHealth.saveBodyMass([{ date, kilograms: 72.5 }])).resolves.toEqual({
      status: 'completed',
      storedRecordingMethods: ['unknown'],
    })

    expect(mockNitroHealth.saveBodyMass).toHaveBeenCalledWith([
      {
        timeMs: date.getTime(),
        kilograms: 72.5,
        writeMetadata: emptyWriteMetadata,
      },
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
      {
        startTimeMs: startDate.getTime(),
        endTimeMs: endDate.getTime(),
        count: 100,
        writeMetadata: emptyWriteMetadata,
      },
      {
        startTimeMs: startDate.getTime(),
        endTimeMs: endDate.getTime(),
        count: 200,
        writeMetadata: {
          ...emptyWriteMetadata,
          sync: { id: 'Record-A', version: 0 },
        },
      },
      {
        startTimeMs: startDate.getTime(),
        endTimeMs: endDate.getTime(),
        count: 300,
        writeMetadata: {
          ...emptyWriteMetadata,
          sync: { id: 'record-a', version: 0 },
        },
      },
    ])
  })

  it('rejects empty sample arrays before crossing the native boundary', async () => {
    await expect(NitroHealth.saveSteps([])).rejects.toThrow('At least one sample is required')
    await expect(NitroHealth.saveDistance([])).rejects.toThrow('At least one sample is required')
    await expect(NitroHealth.saveActiveEnergyBurned([])).rejects.toThrow(
      'At least one sample is required'
    )
    await expect(NitroHealth.saveFloorsClimbed([])).rejects.toThrow(
      'At least one sample is required'
    )
    await expect(NitroHealth.saveHeartRate([])).rejects.toThrow('At least one sample is required')
    await expect(NitroHealth.saveBodyMass([])).rejects.toThrow('At least one sample is required')

    expect(mockNitroHealth.saveSteps).not.toHaveBeenCalled()
    expect(mockNitroHealth.saveDistance).not.toHaveBeenCalled()
    expect(mockNitroHealth.saveActiveEnergyBurned).not.toHaveBeenCalled()
    expect(mockNitroHealth.saveFloorsClimbed).not.toHaveBeenCalled()
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
    await expect(
      NitroHealth.saveFloorsClimbed([
        {
          startDate: new Date('2026-01-01T09:00:00.000Z'),
          endDate: new Date(Number.NaN),
          floors: 1,
        },
      ])
    ).rejects.toThrow('samples[0]: a valid endDate is required')

    expect(mockNitroHealth.saveSteps).not.toHaveBeenCalled()
    expect(mockNitroHealth.saveDistance).not.toHaveBeenCalled()
    expect(mockNitroHealth.saveActiveEnergyBurned).not.toHaveBeenCalled()
    expect(mockNitroHealth.saveFloorsClimbed).not.toHaveBeenCalled()
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
    await expect(
      NitroHealth.saveFloorsClimbed([{ startDate, endDate: startDate, floors: 1 }])
    ).rejects.toThrow('samples[0]: startDate must be before endDate')

    expect(mockNitroHealth.saveSteps).not.toHaveBeenCalled()
    expect(mockNitroHealth.saveFloorsClimbed).not.toHaveBeenCalled()
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
    for (const floors of [-1, Number.NaN, Number.POSITIVE_INFINITY]) {
      await expect(NitroHealth.saveFloorsClimbed([{ startDate, endDate, floors }])).rejects.toThrow(
        'samples[0]: floors must be a non-negative number'
      )
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
    expect(mockNitroHealth.saveFloorsClimbed).not.toHaveBeenCalled()
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
    await expect(
      NitroHealth.saveFloorsClimbed([{ startDate, endDate, floors: 1_000_001 }])
    ).rejects.toThrow('samples[0]: floors must not exceed 1000000')
    await expect(NitroHealth.saveBodyMass([{ date, kilograms: 1_000.5 }])).rejects.toThrow(
      'samples[0]: kilograms must not exceed 1000'
    )

    expect(mockNitroHealth.saveSteps).not.toHaveBeenCalled()
    expect(mockNitroHealth.saveDistance).not.toHaveBeenCalled()
    expect(mockNitroHealth.saveActiveEnergyBurned).not.toHaveBeenCalled()
    expect(mockNitroHealth.saveFloorsClimbed).not.toHaveBeenCalled()
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
