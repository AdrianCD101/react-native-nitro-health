import { mockNitroHealth } from './support/mockNitroHealth'

jest.mock('react-native-nitro-modules', () => ({
  NitroModules: {
    createHybridObject: jest.fn(() => mockNitroHealth),
  },
}))

import { NitroHealth } from 'react-native-nitro-health'

describe('NitroHealth readStatistics contract', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('forwards converted args to the Nitro hybrid object', async () => {
    const startDate = new Date('2026-01-01T00:00:00.000Z')
    const endDate = new Date('2026-01-08T00:00:00.000Z')
    mockNitroHealth.readStatistics.mockResolvedValue([])

    await expect(
      NitroHealth.readStatistics('steps', { startDate, endDate, bucket: 'day', metrics: ['sum'] })
    ).resolves.toEqual([])

    expect(mockNitroHealth.readStatistics).toHaveBeenCalledWith('steps', {
      startTimeMs: startDate.getTime(),
      endTimeMs: endDate.getTime(),
      bucket: 'day',
      metrics: ['sum'],
    })
  })

  it('forwards timeZone to the Nitro hybrid object when provided', async () => {
    const startDate = new Date('2026-01-01T00:00:00.000Z')
    const endDate = new Date('2026-01-08T00:00:00.000Z')
    mockNitroHealth.readStatistics.mockResolvedValue([])

    await expect(
      NitroHealth.readStatistics('steps', {
        startDate,
        endDate,
        bucket: 'day',
        metrics: ['sum'],
        timeZone: 'America/New_York',
      })
    ).resolves.toEqual([])

    expect(mockNitroHealth.readStatistics).toHaveBeenCalledWith('steps', {
      startTimeMs: startDate.getTime(),
      endTimeMs: endDate.getTime(),
      bucket: 'day',
      metrics: ['sum'],
      timeZone: 'America/New_York',
    })
  })

  it.each(['', '   '])(
    'rejects a blank timeZone (%j) before crossing the native boundary',
    async (timeZone) => {
      const startDate = new Date('2026-01-01T00:00:00.000Z')
      const endDate = new Date('2026-01-08T00:00:00.000Z')

      await expect(
        NitroHealth.readStatistics('steps', {
          startDate,
          endDate,
          bucket: 'day',
          metrics: ['sum'],
          timeZone,
        })
      ).rejects.toThrow('timeZone must be a non-empty IANA time-zone identifier')

      expect(mockNitroHealth.readStatistics).not.toHaveBeenCalled()
    }
  )

  it('throws when a native bucket is missing the resolved timeZone', async () => {
    const startDate = new Date('2026-01-01T00:00:00.000Z')
    const endDate = new Date('2026-01-08T00:00:00.000Z')
    mockNitroHealth.readStatistics.mockResolvedValue([
      { startTimeMs: startDate.getTime(), endTimeMs: endDate.getTime(), sum: 1234 },
    ])

    await expect(
      NitroHealth.readStatistics('steps', { startDate, endDate, bucket: 'day', metrics: ['sum'] })
    ).rejects.toThrow('Native statistics are missing timeZone')
  })

  it('maps native results back to HealthStatistics with Date instances', async () => {
    const startDate = new Date('2026-01-01T00:00:00.000Z')
    const endDate = new Date('2026-01-08T00:00:00.000Z')
    const bucketStartMs = new Date('2026-01-01T00:00:00.000Z').getTime()
    const bucketEndMs = new Date('2026-01-02T00:00:00.000Z').getTime()
    mockNitroHealth.readStatistics.mockResolvedValue([
      { startTimeMs: bucketStartMs, endTimeMs: bucketEndMs, sum: 1234, timeZone: 'UTC' },
    ])

    const result = await NitroHealth.readStatistics('steps', {
      startDate,
      endDate,
      bucket: 'day',
      metrics: ['sum'],
    })

    expect(result).toHaveLength(1)
    expect(result[0].startDate).toBeInstanceOf(Date)
    expect(result[0].endDate).toBeInstanceOf(Date)
    expect(result[0].startDate.getTime()).toBe(bucketStartMs)
    expect(result[0].endDate.getTime()).toBe(bucketEndMs)
    expect(result[0].sum).toBe(1234)
    expect(result[0].avg).toBeUndefined()
    expect(result[0].min).toBeUndefined()
    expect(result[0].max).toBeUndefined()
    expect(result[0].timeZone).toBe('UTC')
  })

  it('maps native distance scope onto every public statistics bucket', async () => {
    const startDate = new Date('2026-01-01T00:00:00.000Z')
    const endDate = new Date('2026-01-08T00:00:00.000Z')
    mockNitroHealth.readStatistics.mockResolvedValue([
      {
        startTimeMs: startDate.getTime(),
        endTimeMs: endDate.getTime(),
        sum: 5432,
        scope: 'activityUnspecified',
        timeZone: 'UTC',
      },
    ])

    await expect(
      NitroHealth.readStatistics('distance', {
        startDate,
        endDate,
        bucket: 'day',
        metrics: ['sum'],
      })
    ).resolves.toEqual([
      {
        startDate,
        endDate,
        sum: 5432,
        scope: 'activity-unspecified',
        timeZone: 'UTC',
      },
    ])
  })

  it('preserves whichever optional metrics are present and absent', async () => {
    const startDate = new Date('2026-01-01T00:00:00.000Z')
    const endDate = new Date('2026-01-08T00:00:00.000Z')
    mockNitroHealth.readStatistics.mockResolvedValue([
      {
        startTimeMs: startDate.getTime(),
        endTimeMs: endDate.getTime(),
        avg: 70,
        min: 55,
        max: 130,
        timeZone: 'UTC',
      },
    ])

    const result = await NitroHealth.readStatistics('heartRate', {
      startDate,
      endDate,
      bucket: 'week',
      metrics: ['avg', 'min', 'max'],
    })

    expect(result[0].avg).toBe(70)
    expect(result[0].min).toBe(55)
    expect(result[0].max).toBe(130)
    expect(result[0].sum).toBeUndefined()
  })

  it('rejects an inverted date range before crossing the native boundary', async () => {
    const startDate = new Date('2026-01-08T00:00:00.000Z')
    const endDate = new Date('2026-01-01T00:00:00.000Z')

    await expect(
      NitroHealth.readStatistics('steps', { startDate, endDate, bucket: 'day', metrics: ['sum'] })
    ).rejects.toThrow('startDate must be before endDate')

    expect(mockNitroHealth.readStatistics).not.toHaveBeenCalled()
  })

  it('rejects an invalid Date before crossing the native boundary', async () => {
    const endDate = new Date('2026-01-08T00:00:00.000Z')

    await expect(
      NitroHealth.readStatistics('steps', {
        startDate: new Date(Number.NaN),
        endDate,
        bucket: 'day',
        metrics: ['sum'],
      })
    ).rejects.toThrow('A valid startDate is required')

    expect(mockNitroHealth.readStatistics).not.toHaveBeenCalled()
  })

  it('rejects an empty metrics array before crossing the native boundary', async () => {
    const startDate = new Date('2026-01-01T00:00:00.000Z')
    const endDate = new Date('2026-01-08T00:00:00.000Z')

    await expect(
      NitroHealth.readStatistics('steps', { startDate, endDate, bucket: 'day', metrics: [] })
    ).rejects.toThrow('At least one metric is required')

    expect(mockNitroHealth.readStatistics).not.toHaveBeenCalled()
  })

  it('rejects an unknown metric before crossing the native boundary', async () => {
    const startDate = new Date('2026-01-01T00:00:00.000Z')
    const endDate = new Date('2026-01-08T00:00:00.000Z')

    await expect(
      NitroHealth.readStatistics('steps', {
        startDate,
        endDate,
        bucket: 'day',
        // @ts-expect-error — intentionally invalid metric to exercise runtime validation
        metrics: ['median'],
      })
    ).rejects.toThrow('Unsupported statistics metric: median')

    expect(mockNitroHealth.readStatistics).not.toHaveBeenCalled()
  })

  it('rejects an unknown bucket before crossing the native boundary', async () => {
    const startDate = new Date('2026-01-01T00:00:00.000Z')
    const endDate = new Date('2026-01-08T00:00:00.000Z')

    await expect(
      NitroHealth.readStatistics('steps', {
        startDate,
        endDate,
        // @ts-expect-error — intentionally invalid bucket to exercise runtime validation
        bucket: 'year',
        metrics: ['sum'],
      })
    ).rejects.toThrow('bucket must be one of: hour, day, week, month')

    expect(mockNitroHealth.readStatistics).not.toHaveBeenCalled()
  })

  it("rejects 'sum' for heartRate before crossing the native boundary", async () => {
    const startDate = new Date('2026-01-01T00:00:00.000Z')
    const endDate = new Date('2026-01-08T00:00:00.000Z')

    await expect(
      NitroHealth.readStatistics('heartRate', {
        startDate,
        endDate,
        bucket: 'day',
        metrics: ['sum'],
      })
    ).rejects.toThrow(`Metric 'sum' is not supported for 'heartRate' (supported: avg, min, max)`)

    expect(mockNitroHealth.readStatistics).not.toHaveBeenCalled()
  })

  it("rejects 'avg' for steps before crossing the native boundary", async () => {
    const startDate = new Date('2026-01-01T00:00:00.000Z')
    const endDate = new Date('2026-01-08T00:00:00.000Z')

    await expect(
      NitroHealth.readStatistics('steps', {
        startDate,
        endDate,
        bucket: 'day',
        metrics: ['avg'],
      })
    ).rejects.toThrow(`Metric 'avg' is not supported for 'steps' (supported: sum)`)

    expect(mockNitroHealth.readStatistics).not.toHaveBeenCalled()
  })

  it.each(['sleep', 'workout'] as const)(
    "forwards a 'duration' query for %s to the Nitro hybrid object",
    async (dataType) => {
      const startDate = new Date('2026-01-01T00:00:00.000Z')
      const endDate = new Date('2026-01-08T00:00:00.000Z')
      mockNitroHealth.readStatistics.mockResolvedValue([])

      await expect(
        NitroHealth.readStatistics(dataType, {
          startDate,
          endDate,
          bucket: 'day',
          metrics: ['duration'],
        })
      ).resolves.toEqual([])

      expect(mockNitroHealth.readStatistics).toHaveBeenCalledWith(dataType, {
        startTimeMs: startDate.getTime(),
        endTimeMs: endDate.getTime(),
        bucket: 'day',
        metrics: ['duration'],
      })
    }
  )

  it('maps a native duration bucket back onto HealthStatistics', async () => {
    const startDate = new Date('2026-01-01T00:00:00.000Z')
    const endDate = new Date('2026-01-02T00:00:00.000Z')
    mockNitroHealth.readStatistics.mockResolvedValue([
      {
        startTimeMs: startDate.getTime(),
        endTimeMs: endDate.getTime(),
        duration: 27360,
        timeZone: 'Europe/London',
      },
    ])

    await expect(
      NitroHealth.readStatistics('sleep', {
        startDate,
        endDate,
        bucket: 'day',
        metrics: ['duration'],
      })
    ).resolves.toEqual([
      {
        startDate,
        endDate,
        sum: undefined,
        avg: undefined,
        min: undefined,
        max: undefined,
        duration: 27360,
        timeZone: 'Europe/London',
      },
    ])
  })

  it("rejects 'sum' for sleep before crossing the native boundary", async () => {
    const startDate = new Date('2026-01-01T00:00:00.000Z')
    const endDate = new Date('2026-01-08T00:00:00.000Z')

    await expect(
      NitroHealth.readStatistics('sleep', {
        startDate,
        endDate,
        bucket: 'day',
        metrics: ['sum'],
      })
    ).rejects.toThrow(`Metric 'sum' is not supported for 'sleep' (supported: duration)`)

    expect(mockNitroHealth.readStatistics).not.toHaveBeenCalled()
  })

  it("rejects 'duration' for steps before crossing the native boundary", async () => {
    const startDate = new Date('2026-01-01T00:00:00.000Z')
    const endDate = new Date('2026-01-08T00:00:00.000Z')

    await expect(
      NitroHealth.readStatistics('steps', {
        startDate,
        endDate,
        bucket: 'day',
        metrics: ['duration'],
      })
    ).rejects.toThrow(`Metric 'duration' is not supported for 'steps' (supported: sum)`)

    expect(mockNitroHealth.readStatistics).not.toHaveBeenCalled()
  })
})
