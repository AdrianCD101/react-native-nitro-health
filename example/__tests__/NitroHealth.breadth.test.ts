import {
  mockNitroHealth,
  nativeRecordChildMetadata,
  nativeRecordMetadata,
} from './support/mockNitroHealth'

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
        samples: [
          {
            ...nativeRecordMetadata('resting-heart-record', 'com.example.watch', 'Example Watch'),
            timeMs,
            bpm: 58,
          },
        ],
      })

      const result = await NitroHealth.readRestingHeartRate({ startDate, endDate })

      expect(mockNitroHealth.readRestingHeartRate).toHaveBeenCalledWith({
        startTimeMs: startDate.getTime(),
        endTimeMs: endDate.getTime(),
        limit: 1000,
        ascending: true,
      })
      expect(result.samples).toHaveLength(1)
      expect(result.samples[0].identity).toEqual({
        kind: 'record',
        id: 'resting-heart-record',
      })
      expect(result.samples[0].date).toBeInstanceOf(Date)
      expect(result.samples[0].date.getTime()).toBe(timeMs)
      expect(result.samples[0].bpm).toBe(58)
      expect(result.samples[0].origin).toEqual({
        identifier: 'com.example.watch',
        displayName: 'Example Watch',
      })
    })
  })

  describe('readHeartRateVariability', () => {
    it('passes the method field through untouched', async () => {
      const startDate = new Date('2026-01-01T00:00:00.000Z')
      const endDate = new Date('2026-01-02T00:00:00.000Z')
      const timeMs = new Date('2026-01-01T09:00:00.000Z').getTime()
      mockNitroHealth.readHeartRateVariability.mockResolvedValue({
        samples: [
          {
            ...nativeRecordChildMetadata('hrv-record#0', 'hrv-record', 'com.example.watch'),
            timeMs,
            milliseconds: 42.5,
            method: 'sdnn',
          },
        ],
      })

      const result = await NitroHealth.readHeartRateVariability({ startDate, endDate })

      expect(result.samples).toHaveLength(1)
      expect(result.samples[0].date).toBeInstanceOf(Date)
      expect(result.samples[0].milliseconds).toBe(42.5)
      expect(result.samples[0].method).toBe('sdnn')
      expect(result.samples[0].identity).toEqual({
        kind: 'record-child',
        id: 'hrv-record#0',
        record: { kind: 'record', id: 'hrv-record' },
      })
      expect(result.samples[0].origin.identifier).toBe('com.example.watch')
    })

    it('passes the rmssd method through untouched', async () => {
      const startDate = new Date('2026-01-01T00:00:00.000Z')
      const endDate = new Date('2026-01-02T00:00:00.000Z')
      const timeMs = new Date('2026-01-01T09:00:00.000Z').getTime()
      mockNitroHealth.readHeartRateVariability.mockResolvedValue({
        samples: [
          {
            ...nativeRecordMetadata('hrv-record', 'com.example.health'),
            timeMs,
            milliseconds: 30,
            method: 'rmssd',
          },
        ],
      })

      const result = await NitroHealth.readHeartRateVariability({ startDate, endDate })

      expect(result.samples[0].method).toBe('rmssd')
      expect(result.samples[0].origin).toEqual({
        identifier: 'com.example.health',
        displayName: undefined,
      })
    })
  })

  describe('readBloodPressure', () => {
    it('maps one native sample carrying both values onto a single record identity', async () => {
      const startDate = new Date('2026-01-01T00:00:00.000Z')
      const endDate = new Date('2026-01-02T00:00:00.000Z')
      const timeMs = new Date('2026-01-01T09:00:00.000Z').getTime()
      mockNitroHealth.readBloodPressure.mockResolvedValue({
        samples: [
          {
            ...nativeRecordMetadata('bp-record', 'com.example.cuff', 'Example Cuff'),
            timeMs,
            systolicMmHg: 118,
            diastolicMmHg: 76,
          },
        ],
      })

      const result = await NitroHealth.readBloodPressure({ startDate, endDate })

      expect(mockNitroHealth.readBloodPressure).toHaveBeenCalledWith({
        startTimeMs: startDate.getTime(),
        endTimeMs: endDate.getTime(),
        limit: 1000,
        ascending: true,
      })
      expect(result.samples).toHaveLength(1)
      expect(result.samples[0].identity).toEqual({ kind: 'record', id: 'bp-record' })
      expect(result.samples[0].date).toBeInstanceOf(Date)
      expect(result.samples[0].date.getTime()).toBe(timeMs)
      expect(result.samples[0].systolicMmHg).toBe(118)
      expect(result.samples[0].diastolicMmHg).toBe(76)
      expect(result.samples[0].origin).toEqual({
        identifier: 'com.example.cuff',
        displayName: 'Example Cuff',
      })
    })
  })

  describe('readBloodGlucose', () => {
    it('maps one native sample and leaves the mmol/L value untouched', async () => {
      const startDate = new Date('2026-01-01T00:00:00.000Z')
      const endDate = new Date('2026-01-02T00:00:00.000Z')
      const timeMs = new Date('2026-01-01T09:00:00.000Z').getTime()
      mockNitroHealth.readBloodGlucose.mockResolvedValue({
        samples: [
          {
            ...nativeRecordMetadata('bg-record', 'com.example.meter', 'Example Meter'),
            timeMs,
            millimolesPerLiter: 5.4,
          },
        ],
      })

      const result = await NitroHealth.readBloodGlucose({ startDate, endDate })

      expect(mockNitroHealth.readBloodGlucose).toHaveBeenCalledWith({
        startTimeMs: startDate.getTime(),
        endTimeMs: endDate.getTime(),
        limit: 1000,
        ascending: true,
      })
      expect(result.samples).toHaveLength(1)
      expect(result.samples[0].identity).toEqual({ kind: 'record', id: 'bg-record' })
      expect(result.samples[0].date).toBeInstanceOf(Date)
      expect(result.samples[0].date.getTime()).toBe(timeMs)
      expect(result.samples[0].millimolesPerLiter).toBe(5.4)
      expect(result.samples[0].origin).toEqual({
        identifier: 'com.example.meter',
        displayName: 'Example Meter',
      })
    })
  })

  describe('readBodyTemperature', () => {
    it('maps one native sample and leaves the celsius value untouched', async () => {
      const startDate = new Date('2026-01-01T00:00:00.000Z')
      const endDate = new Date('2026-01-02T00:00:00.000Z')
      const timeMs = new Date('2026-01-01T09:00:00.000Z').getTime()
      mockNitroHealth.readBodyTemperature.mockResolvedValue({
        samples: [
          {
            ...nativeRecordMetadata('bt-record', 'com.example.thermometer', 'Example Thermometer'),
            timeMs,
            celsius: 36.6,
          },
        ],
      })

      const result = await NitroHealth.readBodyTemperature({ startDate, endDate })

      expect(mockNitroHealth.readBodyTemperature).toHaveBeenCalledWith({
        startTimeMs: startDate.getTime(),
        endTimeMs: endDate.getTime(),
        limit: 1000,
        ascending: true,
      })
      expect(result.samples).toHaveLength(1)
      expect(result.samples[0].identity).toEqual({ kind: 'record', id: 'bt-record' })
      expect(result.samples[0].date).toBeInstanceOf(Date)
      expect(result.samples[0].date.getTime()).toBe(timeMs)
      expect(result.samples[0].celsius).toBe(36.6)
      expect(result.samples[0].origin).toEqual({
        identifier: 'com.example.thermometer',
        displayName: 'Example Thermometer',
      })
    })
  })

  describe('readOxygenSaturation', () => {
    it('leaves the percentage value untouched (no JS-side unit conversion)', async () => {
      const startDate = new Date('2026-01-01T00:00:00.000Z')
      const endDate = new Date('2026-01-02T00:00:00.000Z')
      const timeMs = new Date('2026-01-01T09:00:00.000Z').getTime()
      mockNitroHealth.readOxygenSaturation.mockResolvedValue({
        samples: [
          {
            ...nativeRecordMetadata('oxygen-record', 'com.example.watch', 'Example Watch'),
            timeMs,
            percentage: 97.5,
          },
        ],
      })

      const result = await NitroHealth.readOxygenSaturation({ startDate, endDate })

      expect(result.samples).toHaveLength(1)
      expect(result.samples[0].date).toBeInstanceOf(Date)
      expect(result.samples[0].percentage).toBe(97.5)
      expect(result.samples[0].origin).toEqual({
        identifier: 'com.example.watch',
        displayName: 'Example Watch',
      })
    })
  })

  describe('readHeight', () => {
    it('forwards converted args and maps native results to Date instances', async () => {
      const startDate = new Date('2026-01-01T00:00:00.000Z')
      const endDate = new Date('2026-01-02T00:00:00.000Z')
      const timeMs = new Date('2026-01-01T09:00:00.000Z').getTime()
      mockNitroHealth.readHeight.mockResolvedValue({
        samples: [
          {
            ...nativeRecordMetadata('height-record'),
            timeMs,
            meters: 1.78,
          },
        ],
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
      expect(result.samples[0].identity).toEqual({ kind: 'record', id: 'height-record' })
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

  describe('saveBloodPressure', () => {
    it('saves through the Nitro hybrid object', async () => {
      const date = new Date('2026-01-01T09:00:00.000Z')
      mockNitroHealth.saveBloodPressure.mockResolvedValue(undefined)

      await expect(
        NitroHealth.saveBloodPressure([{ date, systolicMmHg: 118, diastolicMmHg: 76 }])
      ).resolves.toBeUndefined()

      expect(mockNitroHealth.saveBloodPressure).toHaveBeenCalledWith([
        { timeMs: date.getTime(), systolicMmHg: 118, diastolicMmHg: 76 },
      ])
    })

    it('rejects systolicMmHg outside 20-200 before crossing the native boundary', async () => {
      const date = new Date('2026-01-01T09:00:00.000Z')

      for (const systolicMmHg of [19, 200.1, Number.NaN, Number.POSITIVE_INFINITY]) {
        await expect(
          NitroHealth.saveBloodPressure([{ date, systolicMmHg, diastolicMmHg: 76 }])
        ).rejects.toThrow('samples[0]: systolicMmHg must be between 20 and 200')
      }

      expect(mockNitroHealth.saveBloodPressure).not.toHaveBeenCalled()
    })

    it('rejects diastolicMmHg outside 10-180 before crossing the native boundary', async () => {
      const date = new Date('2026-01-01T09:00:00.000Z')

      for (const diastolicMmHg of [9, 180.1, Number.NaN, Number.POSITIVE_INFINITY]) {
        await expect(
          NitroHealth.saveBloodPressure([{ date, systolicMmHg: 118, diastolicMmHg }])
        ).rejects.toThrow('samples[0]: diastolicMmHg must be between 10 and 180')
      }

      expect(mockNitroHealth.saveBloodPressure).not.toHaveBeenCalled()
    })

    it('accepts the inclusive bound values', async () => {
      const date = new Date('2026-01-01T09:00:00.000Z')
      mockNitroHealth.saveBloodPressure.mockResolvedValue(undefined)

      await expect(
        NitroHealth.saveBloodPressure([{ date, systolicMmHg: 20, diastolicMmHg: 10 }])
      ).resolves.toBeUndefined()
      await expect(
        NitroHealth.saveBloodPressure([{ date, systolicMmHg: 200, diastolicMmHg: 180 }])
      ).resolves.toBeUndefined()
    })

    it('rejects an invalid sample date before crossing the native boundary', async () => {
      await expect(
        NitroHealth.saveBloodPressure([
          { date: new Date(Number.NaN), systolicMmHg: 118, diastolicMmHg: 76 },
        ])
      ).rejects.toThrow('samples[0]: a valid date is required')

      expect(mockNitroHealth.saveBloodPressure).not.toHaveBeenCalled()
    })
  })

  describe('saveBloodGlucose', () => {
    it('saves through the Nitro hybrid object', async () => {
      const date = new Date('2026-01-01T09:00:00.000Z')
      mockNitroHealth.saveBloodGlucose.mockResolvedValue(undefined)

      await expect(
        NitroHealth.saveBloodGlucose([{ date, millimolesPerLiter: 5.4 }])
      ).resolves.toBeUndefined()

      expect(mockNitroHealth.saveBloodGlucose).toHaveBeenCalledWith([
        { timeMs: date.getTime(), millimolesPerLiter: 5.4 },
      ])
    })

    it('rejects millimolesPerLiter outside 0.5-50 before crossing the native boundary', async () => {
      const date = new Date('2026-01-01T09:00:00.000Z')

      for (const millimolesPerLiter of [0.4, 50.1, Number.NaN, Number.POSITIVE_INFINITY]) {
        await expect(NitroHealth.saveBloodGlucose([{ date, millimolesPerLiter }])).rejects.toThrow(
          'samples[0]: millimolesPerLiter must be between 0.5 and 50'
        )
      }

      expect(mockNitroHealth.saveBloodGlucose).not.toHaveBeenCalled()
    })

    it('accepts the inclusive bound values', async () => {
      const date = new Date('2026-01-01T09:00:00.000Z')
      mockNitroHealth.saveBloodGlucose.mockResolvedValue(undefined)

      await expect(
        NitroHealth.saveBloodGlucose([{ date, millimolesPerLiter: 0.5 }])
      ).resolves.toBeUndefined()
      await expect(
        NitroHealth.saveBloodGlucose([{ date, millimolesPerLiter: 50 }])
      ).resolves.toBeUndefined()
    })

    it('rejects an invalid sample date before crossing the native boundary', async () => {
      await expect(
        NitroHealth.saveBloodGlucose([{ date: new Date(Number.NaN), millimolesPerLiter: 5.4 }])
      ).rejects.toThrow('samples[0]: a valid date is required')

      expect(mockNitroHealth.saveBloodGlucose).not.toHaveBeenCalled()
    })
  })

  describe('saveBodyTemperature', () => {
    it('saves through the Nitro hybrid object', async () => {
      const date = new Date('2026-01-01T09:00:00.000Z')
      mockNitroHealth.saveBodyTemperature.mockResolvedValue(undefined)

      await expect(
        NitroHealth.saveBodyTemperature([{ date, celsius: 36.6 }])
      ).resolves.toBeUndefined()

      expect(mockNitroHealth.saveBodyTemperature).toHaveBeenCalledWith([
        { timeMs: date.getTime(), celsius: 36.6 },
      ])
    })

    it('rejects celsius outside 20-45 before crossing the native boundary', async () => {
      const date = new Date('2026-01-01T09:00:00.000Z')

      for (const celsius of [19, 45.1, Number.NaN, Number.POSITIVE_INFINITY]) {
        await expect(NitroHealth.saveBodyTemperature([{ date, celsius }])).rejects.toThrow(
          'samples[0]: celsius must be between 20 and 45'
        )
      }

      expect(mockNitroHealth.saveBodyTemperature).not.toHaveBeenCalled()
    })

    it('accepts the inclusive bound values', async () => {
      const date = new Date('2026-01-01T09:00:00.000Z')
      mockNitroHealth.saveBodyTemperature.mockResolvedValue(undefined)

      await expect(
        NitroHealth.saveBodyTemperature([{ date, celsius: 20 }])
      ).resolves.toBeUndefined()
      await expect(
        NitroHealth.saveBodyTemperature([{ date, celsius: 45 }])
      ).resolves.toBeUndefined()
    })

    it('rejects an invalid sample date before crossing the native boundary', async () => {
      await expect(
        NitroHealth.saveBodyTemperature([{ date: new Date(Number.NaN), celsius: 36.6 }])
      ).rejects.toThrow('samples[0]: a valid date is required')

      expect(mockNitroHealth.saveBodyTemperature).not.toHaveBeenCalled()
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

    it('rejects bloodPressure entirely before crossing the native boundary', async () => {
      const startDate = new Date('2026-01-01T00:00:00.000Z')
      const endDate = new Date('2026-01-08T00:00:00.000Z')

      await expect(
        NitroHealth.readStatistics('bloodPressure', {
          startDate,
          endDate,
          bucket: 'day',
          metrics: ['avg'],
        })
      ).rejects.toThrow(`readStatistics does not support the 'bloodPressure' data type`)

      expect(mockNitroHealth.readStatistics).not.toHaveBeenCalled()
    })

    it('rejects bloodGlucose entirely before crossing the native boundary', async () => {
      const startDate = new Date('2026-01-01T00:00:00.000Z')
      const endDate = new Date('2026-01-08T00:00:00.000Z')

      await expect(
        NitroHealth.readStatistics('bloodGlucose', {
          startDate,
          endDate,
          bucket: 'day',
          metrics: ['avg'],
        })
      ).rejects.toThrow(`readStatistics does not support the 'bloodGlucose' data type`)

      expect(mockNitroHealth.readStatistics).not.toHaveBeenCalled()
    })

    it('rejects bodyTemperature entirely before crossing the native boundary', async () => {
      const startDate = new Date('2026-01-01T00:00:00.000Z')
      const endDate = new Date('2026-01-08T00:00:00.000Z')

      await expect(
        NitroHealth.readStatistics('bodyTemperature', {
          startDate,
          endDate,
          bucket: 'day',
          metrics: ['avg'],
        })
      ).rejects.toThrow(`readStatistics does not support the 'bodyTemperature' data type`)

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
