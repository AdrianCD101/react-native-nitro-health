import { mockNitroHealth } from './support/mockNitroHealth'

jest.mock('react-native-nitro-modules', () => ({
  NitroModules: {
    createHybridObject: jest.fn(() => mockNitroHealth),
  },
}))

import { NitroHealth } from 'react-native-nitro-health'

describe('NitroHealth breadth data types contract', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('readRestingHeartRate', () => {
    it('forwards converted args and maps native results to Date instances', async () => {
      const startDate = new Date('2026-01-01T00:00:00.000Z')
      const endDate = new Date('2026-01-02T00:00:00.000Z')
      const timeMs = new Date('2026-01-01T09:00:00.000Z').getTime()
      mockNitroHealth.readRestingHeartRate.mockResolvedValue({
        samples: [{ uuid: 'uuid-1', timeMs, bpm: 58, source: 'Watch' }],
      })

      const result = await NitroHealth.readRestingHeartRate({ startDate, endDate })

      expect(mockNitroHealth.readRestingHeartRate).toHaveBeenCalledWith({
        startTimeMs: startDate.getTime(),
        endTimeMs: endDate.getTime(),
        limit: 1000,
        ascending: true,
      })
      expect(result.samples).toHaveLength(1)
      expect(result.samples[0].uuid).toBe('uuid-1')
      expect(result.samples[0].date).toBeInstanceOf(Date)
      expect(result.samples[0].date.getTime()).toBe(timeMs)
      expect(result.samples[0].bpm).toBe(58)
      expect(result.samples[0].source).toBe('Watch')
    })
  })

  describe('readHeartRateVariability', () => {
    it('passes the method field through untouched', async () => {
      const startDate = new Date('2026-01-01T00:00:00.000Z')
      const endDate = new Date('2026-01-02T00:00:00.000Z')
      const timeMs = new Date('2026-01-01T09:00:00.000Z').getTime()
      mockNitroHealth.readHeartRateVariability.mockResolvedValue({
        samples: [{ uuid: 'uuid-1', timeMs, milliseconds: 42.5, method: 'sdnn', source: 'Watch' }],
      })

      const result = await NitroHealth.readHeartRateVariability({ startDate, endDate })

      expect(result.samples).toHaveLength(1)
      expect(result.samples[0].date).toBeInstanceOf(Date)
      expect(result.samples[0].milliseconds).toBe(42.5)
      expect(result.samples[0].method).toBe('sdnn')
      expect(result.samples[0].source).toBe('Watch')
    })

    it('passes the rmssd method through untouched', async () => {
      const startDate = new Date('2026-01-01T00:00:00.000Z')
      const endDate = new Date('2026-01-02T00:00:00.000Z')
      const timeMs = new Date('2026-01-01T09:00:00.000Z').getTime()
      mockNitroHealth.readHeartRateVariability.mockResolvedValue({
        samples: [{ uuid: 'uuid-1', timeMs, milliseconds: 30, method: 'rmssd' }],
      })

      const result = await NitroHealth.readHeartRateVariability({ startDate, endDate })

      expect(result.samples[0].method).toBe('rmssd')
      expect(result.samples[0].source).toBeUndefined()
    })
  })

  describe('readOxygenSaturation', () => {
    it('leaves the percentage value untouched (no JS-side unit conversion)', async () => {
      const startDate = new Date('2026-01-01T00:00:00.000Z')
      const endDate = new Date('2026-01-02T00:00:00.000Z')
      const timeMs = new Date('2026-01-01T09:00:00.000Z').getTime()
      mockNitroHealth.readOxygenSaturation.mockResolvedValue({
        samples: [{ uuid: 'uuid-1', timeMs, percentage: 97.5, source: 'Watch' }],
      })

      const result = await NitroHealth.readOxygenSaturation({ startDate, endDate })

      expect(result.samples).toHaveLength(1)
      expect(result.samples[0].date).toBeInstanceOf(Date)
      expect(result.samples[0].percentage).toBe(97.5)
      expect(result.samples[0].source).toBe('Watch')
    })
  })

  describe('readHeight', () => {
    it('forwards converted args and maps native results to Date instances', async () => {
      const startDate = new Date('2026-01-01T00:00:00.000Z')
      const endDate = new Date('2026-01-02T00:00:00.000Z')
      const timeMs = new Date('2026-01-01T09:00:00.000Z').getTime()
      mockNitroHealth.readHeight.mockResolvedValue({
        samples: [{ uuid: 'uuid-1', timeMs, meters: 1.78 }],
      })

      const result = await NitroHealth.readHeight({ startDate, endDate })

      expect(mockNitroHealth.readHeight).toHaveBeenCalledWith({
        startTimeMs: startDate.getTime(),
        endTimeMs: endDate.getTime(),
        limit: 1000,
        ascending: true,
      })
      expect(result.samples).toHaveLength(1)
      expect(result.samples[0].date).toBeInstanceOf(Date)
      expect(result.samples[0].meters).toBe(1.78)
    })
  })

  describe('saveRestingHeartRate', () => {
    it('saves through the Nitro hybrid object', async () => {
      const date = new Date('2026-01-01T09:00:00.000Z')
      mockNitroHealth.saveRestingHeartRate.mockResolvedValue(undefined)

      await expect(NitroHealth.saveRestingHeartRate([{ date, bpm: 58 }])).resolves.toBeUndefined()

      expect(mockNitroHealth.saveRestingHeartRate).toHaveBeenCalledWith([
        { timeMs: date.getTime(), bpm: 58 },
      ])
    })

    it('rejects bpm outside 1-300 before crossing the native boundary', async () => {
      const date = new Date('2026-01-01T09:00:00.000Z')

      for (const bpm of [0, -1, 0.5, 301, Number.NaN, Number.POSITIVE_INFINITY]) {
        await expect(NitroHealth.saveRestingHeartRate([{ date, bpm }])).rejects.toThrow(
          'samples[0]: bpm must be between 1 and 300'
        )
      }

      expect(mockNitroHealth.saveRestingHeartRate).not.toHaveBeenCalled()
    })

    it('rejects an empty sample array before crossing the native boundary', async () => {
      await expect(NitroHealth.saveRestingHeartRate([])).rejects.toThrow(
        'At least one sample is required'
      )

      expect(mockNitroHealth.saveRestingHeartRate).not.toHaveBeenCalled()
    })

    it('rejects an invalid sample date before crossing the native boundary', async () => {
      await expect(
        NitroHealth.saveRestingHeartRate([{ date: new Date(Number.NaN), bpm: 58 }])
      ).rejects.toThrow('samples[0]: a valid date is required')

      expect(mockNitroHealth.saveRestingHeartRate).not.toHaveBeenCalled()
    })
  })

  describe('saveOxygenSaturation', () => {
    it('saves through the Nitro hybrid object', async () => {
      const date = new Date('2026-01-01T09:00:00.000Z')
      mockNitroHealth.saveOxygenSaturation.mockResolvedValue(undefined)

      await expect(
        NitroHealth.saveOxygenSaturation([{ date, percentage: 97.5 }])
      ).resolves.toBeUndefined()

      expect(mockNitroHealth.saveOxygenSaturation).toHaveBeenCalledWith([
        { timeMs: date.getTime(), percentage: 97.5 },
      ])
    })

    it('rejects percentage outside 0-100 before crossing the native boundary', async () => {
      const date = new Date('2026-01-01T09:00:00.000Z')

      for (const percentage of [-1, 100.1, Number.NaN, Number.POSITIVE_INFINITY]) {
        await expect(NitroHealth.saveOxygenSaturation([{ date, percentage }])).rejects.toThrow(
          'samples[0]: percentage must be between 0 and 100'
        )
      }

      expect(mockNitroHealth.saveOxygenSaturation).not.toHaveBeenCalled()
    })

    it('accepts the inclusive 0 and 100 boundaries', async () => {
      const date = new Date('2026-01-01T09:00:00.000Z')
      mockNitroHealth.saveOxygenSaturation.mockResolvedValue(undefined)

      await expect(
        NitroHealth.saveOxygenSaturation([{ date, percentage: 0 }])
      ).resolves.toBeUndefined()
      await expect(
        NitroHealth.saveOxygenSaturation([{ date, percentage: 100 }])
      ).resolves.toBeUndefined()
    })
  })

  describe('saveHeight', () => {
    it('saves through the Nitro hybrid object', async () => {
      const date = new Date('2026-01-01T09:00:00.000Z')
      mockNitroHealth.saveHeight.mockResolvedValue(undefined)

      await expect(NitroHealth.saveHeight([{ date, meters: 1.78 }])).resolves.toBeUndefined()

      expect(mockNitroHealth.saveHeight).toHaveBeenCalledWith([
        { timeMs: date.getTime(), meters: 1.78 },
      ])
    })

    it('rejects meters that are not greater than 0 before crossing the native boundary', async () => {
      const date = new Date('2026-01-01T09:00:00.000Z')

      for (const meters of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
        await expect(NitroHealth.saveHeight([{ date, meters }])).rejects.toThrow(
          'samples[0]: meters must be greater than 0'
        )
      }

      expect(mockNitroHealth.saveHeight).not.toHaveBeenCalled()
    })

    it('rejects meters above the 3 meter cap before crossing the native boundary', async () => {
      const date = new Date('2026-01-01T09:00:00.000Z')

      await expect(NitroHealth.saveHeight([{ date, meters: 3.01 }])).rejects.toThrow(
        'samples[0]: meters must not exceed 3'
      )

      expect(mockNitroHealth.saveHeight).not.toHaveBeenCalled()
    })
  })

  describe('readStatistics for the new data types', () => {
    it('accepts avg/min/max for restingHeartRate', async () => {
      const startDate = new Date('2026-01-01T00:00:00.000Z')
      const endDate = new Date('2026-01-08T00:00:00.000Z')
      mockNitroHealth.readStatistics.mockResolvedValue([])

      await expect(
        NitroHealth.readStatistics('restingHeartRate', {
          startDate,
          endDate,
          bucket: 'day',
          metrics: ['avg', 'min', 'max'],
        })
      ).resolves.toEqual([])

      expect(mockNitroHealth.readStatistics).toHaveBeenCalledWith('restingHeartRate', {
        startTimeMs: startDate.getTime(),
        endTimeMs: endDate.getTime(),
        bucket: 'day',
        metrics: ['avg', 'min', 'max'],
      })
    })

    it('accepts avg/min/max for height', async () => {
      const startDate = new Date('2026-01-01T00:00:00.000Z')
      const endDate = new Date('2026-01-08T00:00:00.000Z')
      mockNitroHealth.readStatistics.mockResolvedValue([])

      await expect(
        NitroHealth.readStatistics('height', {
          startDate,
          endDate,
          bucket: 'week',
          metrics: ['avg'],
        })
      ).resolves.toEqual([])

      expect(mockNitroHealth.readStatistics).toHaveBeenCalledWith('height', {
        startTimeMs: startDate.getTime(),
        endTimeMs: endDate.getTime(),
        bucket: 'week',
        metrics: ['avg'],
      })
    })

    it('rejects heartRateVariability entirely before crossing the native boundary', async () => {
      const startDate = new Date('2026-01-01T00:00:00.000Z')
      const endDate = new Date('2026-01-08T00:00:00.000Z')

      await expect(
        NitroHealth.readStatistics('heartRateVariability', {
          startDate,
          endDate,
          bucket: 'day',
          metrics: ['avg'],
        })
      ).rejects.toThrow(`readStatistics does not support the 'heartRateVariability' data type`)

      expect(mockNitroHealth.readStatistics).not.toHaveBeenCalled()
    })

    it('rejects oxygenSaturation entirely before crossing the native boundary', async () => {
      const startDate = new Date('2026-01-01T00:00:00.000Z')
      const endDate = new Date('2026-01-08T00:00:00.000Z')

      await expect(
        NitroHealth.readStatistics('oxygenSaturation', {
          startDate,
          endDate,
          bucket: 'day',
          metrics: ['avg'],
        })
      ).rejects.toThrow(`readStatistics does not support the 'oxygenSaturation' data type`)

      expect(mockNitroHealth.readStatistics).not.toHaveBeenCalled()
    })
  })
})
