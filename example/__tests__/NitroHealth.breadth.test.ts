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

const nativeUnknownWriteResult = { storedRecordingMethods: ['unknown' as const] }
const emptyWriteMetadata = {
  provenance: {
    deviceType: undefined,
    deviceManufacturer: undefined,
    deviceModel: undefined,
    recordingMethod: undefined,
  },
}
const unknownWriteResult = {
  status: 'completed' as const,
  storedRecordingMethods: ['unknown' as const],
}

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

    it('maps every native recording method to its public value in sample order', async () => {
      const startDate = new Date('2026-01-01T00:00:00.000Z')
      const endDate = new Date('2026-01-02T00:00:00.000Z')
      const timeMs = new Date('2026-01-01T09:00:00.000Z').getTime()
      mockNitroHealth.readRestingHeartRate.mockResolvedValue({
        samples: [
          {
            ...nativeRecordMetadata('manual-record', 'com.example.health', undefined, 'manual'),
            timeMs,
            bpm: 58,
          },
          {
            ...nativeRecordMetadata(
              'active-record',
              'com.example.health',
              undefined,
              'activelyRecorded'
            ),
            timeMs,
            bpm: 59,
          },
          {
            ...nativeRecordMetadata(
              'automatic-record',
              'com.example.health',
              undefined,
              'automaticallyRecorded'
            ),
            timeMs,
            bpm: 60,
          },
          {
            ...nativeRecordMetadata('unknown-record', 'com.example.health', undefined, 'unknown'),
            timeMs,
            bpm: 61,
          },
        ],
      })

      const result = await NitroHealth.readRestingHeartRate({ startDate, endDate })

      expect(result.samples.map(({ recordingMethod }) => recordingMethod)).toEqual([
        'manual',
        'actively-recorded',
        'automatically-recorded',
        'unknown',
      ])
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
            androidBodyPosition: 'sittingDown',
            androidMeasurementLocation: 'leftUpperArm',
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
      expect(result.samples[0].metadata).toEqual({
        android: {
          bodyPosition: 'sitting_down',
          measurementLocation: 'left_upper_arm',
        },
      })
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
            androidSpecimenSource: 'capillaryBlood',
            androidMealType: 'breakfast',
            androidRelationToMeal: 'beforeMeal',
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
      expect(result.samples[0].metadata).toEqual({
        android: {
          specimenSource: 'capillary_blood',
          mealType: 'breakfast',
          relationToMeal: 'before_meal',
        },
      })
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
            androidMeasurementLocation: 'mouth',
            iosSensorLocation: 'earDrum',
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
      expect(result.samples[0].metadata).toEqual({
        android: { measurementLocation: 'mouth' },
        ios: { sensorLocation: 'ear_drum' },
      })
      expect(result.samples[0].origin).toEqual({
        identifier: 'com.example.thermometer',
        displayName: 'Example Thermometer',
      })
    })
  })

  describe('readRespiratoryRate', () => {
    it('maps one native sample and leaves the breathsPerMinute value untouched', async () => {
      const startDate = new Date('2026-01-01T00:00:00.000Z')
      const endDate = new Date('2026-01-02T00:00:00.000Z')
      const timeMs = new Date('2026-01-01T09:00:00.000Z').getTime()
      mockNitroHealth.readRespiratoryRate.mockResolvedValue({
        samples: [
          {
            ...nativeRecordMetadata('rr-record', 'com.example.tracker', 'Example Tracker'),
            timeMs,
            breathsPerMinute: 16.5,
          },
        ],
      })

      const result = await NitroHealth.readRespiratoryRate({ startDate, endDate })

      expect(mockNitroHealth.readRespiratoryRate).toHaveBeenCalledWith({
        startTimeMs: startDate.getTime(),
        endTimeMs: endDate.getTime(),
        limit: 1000,
        ascending: true,
      })
      expect(result.samples).toHaveLength(1)
      expect(result.samples[0].identity).toEqual({ kind: 'record', id: 'rr-record' })
      expect(result.samples[0].date).toBeInstanceOf(Date)
      expect(result.samples[0].date.getTime()).toBe(timeMs)
      expect(result.samples[0].breathsPerMinute).toBe(16.5)
      expect(result.samples[0].origin).toEqual({
        identifier: 'com.example.tracker',
        displayName: 'Example Tracker',
      })
    })
  })

  describe('readBodyFat', () => {
    it('maps one native sample and leaves the percentage value untouched at the JS layer', async () => {
      const startDate = new Date('2026-01-01T00:00:00.000Z')
      const endDate = new Date('2026-01-02T00:00:00.000Z')
      const timeMs = new Date('2026-01-01T09:00:00.000Z').getTime()
      mockNitroHealth.readBodyFat.mockResolvedValue({
        samples: [
          {
            ...nativeRecordMetadata('bf-record', 'com.example.scale', 'Example Scale'),
            timeMs,
            percentage: 18.5,
          },
        ],
      })

      const result = await NitroHealth.readBodyFat({ startDate, endDate })

      expect(mockNitroHealth.readBodyFat).toHaveBeenCalledWith({
        startTimeMs: startDate.getTime(),
        endTimeMs: endDate.getTime(),
        limit: 1000,
        ascending: true,
      })
      expect(result.samples).toHaveLength(1)
      expect(result.samples[0].identity).toEqual({ kind: 'record', id: 'bf-record' })
      expect(result.samples[0].date).toBeInstanceOf(Date)
      expect(result.samples[0].date.getTime()).toBe(timeMs)
      expect(result.samples[0].percentage).toBe(18.5)
      expect(result.samples[0].origin).toEqual({
        identifier: 'com.example.scale',
        displayName: 'Example Scale',
      })
    })
  })

  describe('readLeanBodyMass', () => {
    it('maps one native sample and leaves the kilograms value untouched', async () => {
      const startDate = new Date('2026-01-01T00:00:00.000Z')
      const endDate = new Date('2026-01-02T00:00:00.000Z')
      const timeMs = new Date('2026-01-01T09:00:00.000Z').getTime()
      mockNitroHealth.readLeanBodyMass.mockResolvedValue({
        samples: [
          {
            ...nativeRecordMetadata('lbm-record', 'com.example.scale', 'Example Scale'),
            timeMs,
            kilograms: 55.4,
          },
        ],
      })

      const result = await NitroHealth.readLeanBodyMass({ startDate, endDate })

      expect(mockNitroHealth.readLeanBodyMass).toHaveBeenCalledWith({
        startTimeMs: startDate.getTime(),
        endTimeMs: endDate.getTime(),
        limit: 1000,
        ascending: true,
      })
      expect(result.samples).toHaveLength(1)
      expect(result.samples[0].identity).toEqual({ kind: 'record', id: 'lbm-record' })
      expect(result.samples[0].date).toBeInstanceOf(Date)
      expect(result.samples[0].date.getTime()).toBe(timeMs)
      expect(result.samples[0].kilograms).toBe(55.4)
      expect(result.samples[0].origin).toEqual({
        identifier: 'com.example.scale',
        displayName: 'Example Scale',
      })
    })
  })

  describe('readBasalBodyTemperature', () => {
    it('maps one native sample and leaves the celsius value untouched', async () => {
      const startDate = new Date('2026-01-01T00:00:00.000Z')
      const endDate = new Date('2026-01-02T00:00:00.000Z')
      const timeMs = new Date('2026-01-01T06:30:00.000Z').getTime()
      mockNitroHealth.readBasalBodyTemperature.mockResolvedValue({
        samples: [
          {
            ...nativeRecordMetadata('bbt-record', 'com.example.thermometer', 'Example Thermometer'),
            timeMs,
            celsius: 36.4,
            androidMeasurementLocation: 'wrist',
          },
        ],
      })

      const result = await NitroHealth.readBasalBodyTemperature({ startDate, endDate })

      expect(mockNitroHealth.readBasalBodyTemperature).toHaveBeenCalledWith({
        startTimeMs: startDate.getTime(),
        endTimeMs: endDate.getTime(),
        limit: 1000,
        ascending: true,
      })
      expect(result.samples).toHaveLength(1)
      expect(result.samples[0].identity).toEqual({ kind: 'record', id: 'bbt-record' })
      expect(result.samples[0].date).toBeInstanceOf(Date)
      expect(result.samples[0].date.getTime()).toBe(timeMs)
      expect(result.samples[0].celsius).toBe(36.4)
      expect(result.samples[0].metadata).toEqual({
        android: { measurementLocation: 'wrist' },
      })
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

  describe('readVo2Max', () => {
    it('maps one native sample and leaves the millilitersPerKilogramPerMinute value untouched', async () => {
      const startDate = new Date('2026-01-01T00:00:00.000Z')
      const endDate = new Date('2026-01-02T00:00:00.000Z')
      const timeMs = new Date('2026-01-01T09:00:00.000Z').getTime()
      mockNitroHealth.readVo2Max.mockResolvedValue({
        samples: [
          {
            ...nativeRecordMetadata('vo2max-record', 'com.example.tracker', 'Example Tracker'),
            timeMs,
            millilitersPerKilogramPerMinute: 42.5,
            androidMeasurementMethod: 'multistageFitnessTest',
            iosTestType: 'maxExercise',
          },
        ],
      })

      const result = await NitroHealth.readVo2Max({ startDate, endDate })

      expect(mockNitroHealth.readVo2Max).toHaveBeenCalledWith({
        startTimeMs: startDate.getTime(),
        endTimeMs: endDate.getTime(),
        limit: 1000,
        ascending: true,
      })
      expect(result.samples).toHaveLength(1)
      expect(result.samples[0].identity).toEqual({ kind: 'record', id: 'vo2max-record' })
      expect(result.samples[0].date).toBeInstanceOf(Date)
      expect(result.samples[0].date.getTime()).toBe(timeMs)
      expect(result.samples[0].millilitersPerKilogramPerMinute).toBe(42.5)
      expect(result.samples[0].metadata).toEqual({
        android: { measurementMethod: 'multistage_fitness_test' },
        ios: { testType: 'max_exercise' },
      })
      expect(result.samples[0].origin).toEqual({
        identifier: 'com.example.tracker',
        displayName: 'Example Tracker',
      })
    })
  })

  describe('readFloorsClimbed', () => {
    it('maps one native sample and leaves the floors value untouched', async () => {
      const startDate = new Date('2026-01-01T00:00:00.000Z')
      const endDate = new Date('2026-01-02T00:00:00.000Z')
      const startTimeMs = new Date('2026-01-01T09:00:00.000Z').getTime()
      const endTimeMs = new Date('2026-01-01T09:30:00.000Z').getTime()
      mockNitroHealth.readFloorsClimbed.mockResolvedValue({
        samples: [
          {
            ...nativeRecordMetadata('floors-record', 'com.example.tracker', 'Example Tracker'),
            startTimeMs,
            endTimeMs,
            floors: 12.5,
          },
        ],
      })

      const result = await NitroHealth.readFloorsClimbed({ startDate, endDate })

      expect(mockNitroHealth.readFloorsClimbed).toHaveBeenCalledWith({
        startTimeMs: startDate.getTime(),
        endTimeMs: endDate.getTime(),
        limit: 1000,
        ascending: true,
      })
      expect(result.samples).toHaveLength(1)
      expect(result.samples[0].identity).toEqual({ kind: 'record', id: 'floors-record' })
      expect(result.samples[0].startDate).toBeInstanceOf(Date)
      expect(result.samples[0].startDate.getTime()).toBe(startTimeMs)
      expect(result.samples[0].endDate).toBeInstanceOf(Date)
      expect(result.samples[0].endDate.getTime()).toBe(endTimeMs)
      expect(result.samples[0].floors).toBe(12.5)
      expect(result.samples[0].origin).toEqual({
        identifier: 'com.example.tracker',
        displayName: 'Example Tracker',
      })
    })
  })

  describe('saveRestingHeartRate', () => {
    it('saves through the Nitro hybrid object', async () => {
      const date = new Date('2026-01-01T09:00:00.000Z')
      mockNitroHealth.saveRestingHeartRate.mockResolvedValue(nativeUnknownWriteResult)

      await expect(NitroHealth.saveRestingHeartRate([{ date, bpm: 58 }])).resolves.toEqual(
        unknownWriteResult
      )

      expect(mockNitroHealth.saveRestingHeartRate).toHaveBeenCalledWith([
        { timeMs: date.getTime(), bpm: 58, writeMetadata: emptyWriteMetadata },
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
      mockNitroHealth.saveBloodPressure.mockResolvedValue(nativeUnknownWriteResult)

      await expect(
        NitroHealth.saveBloodPressure([{ date, systolicMmHg: 118, diastolicMmHg: 76 }])
      ).resolves.toEqual(unknownWriteResult)

      expect(mockNitroHealth.saveBloodPressure).toHaveBeenCalledWith([
        {
          timeMs: date.getTime(),
          systolicMmHg: 118,
          diastolicMmHg: 76,
          writeMetadata: emptyWriteMetadata,
        },
      ])
    })

    it('maps typed Android metadata through the native transport', async () => {
      const date = new Date('2026-01-01T09:00:00.000Z')
      mockNitroHealth.saveBloodPressure.mockResolvedValue(nativeUnknownWriteResult)

      await NitroHealth.saveBloodPressure([
        {
          date,
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

      expect(mockNitroHealth.saveBloodPressure).toHaveBeenCalledWith([
        {
          timeMs: date.getTime(),
          systolicMmHg: 118,
          diastolicMmHg: 76,
          writeMetadata: emptyWriteMetadata,
          androidBodyPosition: 'sittingDown',
          androidMeasurementLocation: 'leftUpperArm',
        },
      ])
    })

    it('accepts partial Android metadata and leaves the other field absent', async () => {
      const date = new Date('2026-01-01T09:00:00.000Z')
      mockNitroHealth.saveBloodPressure.mockResolvedValue(nativeUnknownWriteResult)

      await NitroHealth.saveBloodPressure([
        {
          date,
          systolicMmHg: 118,
          diastolicMmHg: 76,
          metadata: { android: { bodyPosition: 'standing_up' } },
        },
      ])

      expect(mockNitroHealth.saveBloodPressure).toHaveBeenCalledWith([
        {
          timeMs: date.getTime(),
          systolicMmHg: 118,
          diastolicMmHg: 76,
          writeMetadata: emptyWriteMetadata,
          androidBodyPosition: 'standingUp',
        },
      ])
    })

    it('rejects incomplete native metadata instead of fabricating a read value', async () => {
      const timeMs = new Date('2026-01-01T09:00:00.000Z').getTime()
      mockNitroHealth.readBloodPressure.mockResolvedValue({
        samples: [
          {
            ...nativeRecordMetadata('bp-record'),
            timeMs,
            systolicMmHg: 118,
            diastolicMmHg: 76,
            androidBodyPosition: 'standingUp',
          },
        ],
      })

      await expect(
        NitroHealth.readBloodPressure({
          startDate: new Date('2026-01-01T00:00:00.000Z'),
          endDate: new Date('2026-01-02T00:00:00.000Z'),
        })
      ).rejects.toThrow('Native blood pressure metadata is incomplete')
    })

    it('rejects unsupported Android metadata before crossing the native boundary', async () => {
      const date = new Date('2026-01-01T09:00:00.000Z')

      await expect(
        NitroHealth.saveBloodPressure([
          {
            date,
            systolicMmHg: 118,
            diastolicMmHg: 76,
            metadata: { android: { bodyPosition: 'upside_down' } },
          } as never,
        ])
      ).rejects.toThrow('samples[0]: metadata.android.bodyPosition is unsupported')

      expect(mockNitroHealth.saveBloodPressure).not.toHaveBeenCalled()
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
      mockNitroHealth.saveBloodPressure.mockResolvedValue(nativeUnknownWriteResult)

      await expect(
        NitroHealth.saveBloodPressure([{ date, systolicMmHg: 20, diastolicMmHg: 10 }])
      ).resolves.toEqual(unknownWriteResult)
      await expect(
        NitroHealth.saveBloodPressure([{ date, systolicMmHg: 200, diastolicMmHg: 180 }])
      ).resolves.toEqual(unknownWriteResult)
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
      mockNitroHealth.saveBloodGlucose.mockResolvedValue(nativeUnknownWriteResult)

      await expect(
        NitroHealth.saveBloodGlucose([{ date, millimolesPerLiter: 5.4 }])
      ).resolves.toEqual(unknownWriteResult)

      expect(mockNitroHealth.saveBloodGlucose).toHaveBeenCalledWith([
        { timeMs: date.getTime(), millimolesPerLiter: 5.4, writeMetadata: emptyWriteMetadata },
      ])
    })

    it('maps both platform metadata scopes through the native transport', async () => {
      const date = new Date('2026-01-01T09:00:00.000Z')
      mockNitroHealth.saveBloodGlucose.mockResolvedValue(nativeUnknownWriteResult)

      await NitroHealth.saveBloodGlucose([
        {
          date,
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

      expect(mockNitroHealth.saveBloodGlucose).toHaveBeenCalledWith([
        {
          timeMs: date.getTime(),
          millimolesPerLiter: 5.4,
          writeMetadata: emptyWriteMetadata,
          androidSpecimenSource: 'capillaryBlood',
          androidMealType: 'breakfast',
          androidRelationToMeal: 'beforeMeal',
          iosMealTime: 'preprandial',
        },
      ])
    })

    it('rejects unsupported platform metadata before crossing the native boundary', async () => {
      const date = new Date('2026-01-01T09:00:00.000Z')

      await expect(
        NitroHealth.saveBloodGlucose([
          {
            date,
            millimolesPerLiter: 5.4,
            metadata: { android: { relationToMeal: 'during_meal' } },
          } as never,
        ])
      ).rejects.toThrow('samples[0]: metadata.android.relationToMeal is unsupported')

      expect(mockNitroHealth.saveBloodGlucose).not.toHaveBeenCalled()
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
      mockNitroHealth.saveBloodGlucose.mockResolvedValue(nativeUnknownWriteResult)

      await expect(
        NitroHealth.saveBloodGlucose([{ date, millimolesPerLiter: 0.5 }])
      ).resolves.toEqual(unknownWriteResult)
      await expect(
        NitroHealth.saveBloodGlucose([{ date, millimolesPerLiter: 50 }])
      ).resolves.toEqual(unknownWriteResult)
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
      mockNitroHealth.saveBodyTemperature.mockResolvedValue(nativeUnknownWriteResult)

      await expect(NitroHealth.saveBodyTemperature([{ date, celsius: 36.6 }])).resolves.toEqual(
        unknownWriteResult
      )

      expect(mockNitroHealth.saveBodyTemperature).toHaveBeenCalledWith([
        { timeMs: date.getTime(), celsius: 36.6, writeMetadata: emptyWriteMetadata },
      ])
    })

    it('maps both platform metadata scopes through the native transport', async () => {
      const date = new Date('2026-01-01T09:00:00.000Z')
      mockNitroHealth.saveBodyTemperature.mockResolvedValue(nativeUnknownWriteResult)

      await NitroHealth.saveBodyTemperature([
        {
          date,
          celsius: 36.6,
          metadata: {
            android: { measurementLocation: 'temporal_artery' },
            ios: { sensorLocation: 'gastro_intestinal' },
          },
        },
      ])

      expect(mockNitroHealth.saveBodyTemperature).toHaveBeenCalledWith([
        {
          timeMs: date.getTime(),
          celsius: 36.6,
          writeMetadata: emptyWriteMetadata,
          androidMeasurementLocation: 'temporalArtery',
          iosSensorLocation: 'gastroIntestinal',
        },
      ])
    })

    it('rejects unsupported location metadata before crossing the native boundary', async () => {
      const date = new Date('2026-01-01T09:00:00.000Z')

      await expect(
        NitroHealth.saveBodyTemperature([
          {
            date,
            celsius: 36.6,
            metadata: { ios: { sensorLocation: 'neck' } },
          } as never,
        ])
      ).rejects.toThrow('samples[0]: metadata.ios.sensorLocation is unsupported')

      expect(mockNitroHealth.saveBodyTemperature).not.toHaveBeenCalled()
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
      mockNitroHealth.saveBodyTemperature.mockResolvedValue(nativeUnknownWriteResult)

      await expect(NitroHealth.saveBodyTemperature([{ date, celsius: 20 }])).resolves.toEqual(
        unknownWriteResult
      )
      await expect(NitroHealth.saveBodyTemperature([{ date, celsius: 45 }])).resolves.toEqual(
        unknownWriteResult
      )
    })

    it('rejects an invalid sample date before crossing the native boundary', async () => {
      await expect(
        NitroHealth.saveBodyTemperature([{ date: new Date(Number.NaN), celsius: 36.6 }])
      ).rejects.toThrow('samples[0]: a valid date is required')

      expect(mockNitroHealth.saveBodyTemperature).not.toHaveBeenCalled()
    })
  })

  describe('saveRespiratoryRate', () => {
    it('saves through the Nitro hybrid object', async () => {
      const date = new Date('2026-01-01T09:00:00.000Z')
      mockNitroHealth.saveRespiratoryRate.mockResolvedValue(nativeUnknownWriteResult)

      await expect(
        NitroHealth.saveRespiratoryRate([{ date, breathsPerMinute: 16.5 }])
      ).resolves.toEqual(unknownWriteResult)

      expect(mockNitroHealth.saveRespiratoryRate).toHaveBeenCalledWith([
        {
          timeMs: date.getTime(),
          breathsPerMinute: 16.5,
          writeMetadata: emptyWriteMetadata,
        },
      ])
    })

    it('rejects breathsPerMinute outside 0-120 before crossing the native boundary', async () => {
      const date = new Date('2026-01-01T09:00:00.000Z')

      for (const breathsPerMinute of [-1, 120.1, Number.NaN, Number.POSITIVE_INFINITY]) {
        await expect(NitroHealth.saveRespiratoryRate([{ date, breathsPerMinute }])).rejects.toThrow(
          'samples[0]: breathsPerMinute must be between 0 and 120'
        )
      }

      expect(mockNitroHealth.saveRespiratoryRate).not.toHaveBeenCalled()
    })

    it('accepts the inclusive bound values', async () => {
      const date = new Date('2026-01-01T09:00:00.000Z')
      mockNitroHealth.saveRespiratoryRate.mockResolvedValue(nativeUnknownWriteResult)

      await expect(
        NitroHealth.saveRespiratoryRate([{ date, breathsPerMinute: 0 }])
      ).resolves.toEqual(unknownWriteResult)
      await expect(
        NitroHealth.saveRespiratoryRate([{ date, breathsPerMinute: 120 }])
      ).resolves.toEqual(unknownWriteResult)
    })

    it('rejects an invalid sample date before crossing the native boundary', async () => {
      await expect(
        NitroHealth.saveRespiratoryRate([{ date: new Date(Number.NaN), breathsPerMinute: 16.5 }])
      ).rejects.toThrow('samples[0]: a valid date is required')

      expect(mockNitroHealth.saveRespiratoryRate).not.toHaveBeenCalled()
    })
  })

  describe('saveBodyFat', () => {
    it('saves through the Nitro hybrid object', async () => {
      const date = new Date('2026-01-01T09:00:00.000Z')
      mockNitroHealth.saveBodyFat.mockResolvedValue(nativeUnknownWriteResult)

      await expect(NitroHealth.saveBodyFat([{ date, percentage: 18.5 }])).resolves.toEqual(
        unknownWriteResult
      )

      expect(mockNitroHealth.saveBodyFat).toHaveBeenCalledWith([
        { timeMs: date.getTime(), percentage: 18.5, writeMetadata: emptyWriteMetadata },
      ])
    })

    it('rejects percentage outside 0-100 before crossing the native boundary', async () => {
      const date = new Date('2026-01-01T09:00:00.000Z')

      for (const percentage of [-1, 100.1, Number.NaN, Number.POSITIVE_INFINITY]) {
        await expect(NitroHealth.saveBodyFat([{ date, percentage }])).rejects.toThrow(
          'samples[0]: percentage must be between 0 and 100'
        )
      }

      expect(mockNitroHealth.saveBodyFat).not.toHaveBeenCalled()
    })

    it('accepts the inclusive bound values', async () => {
      const date = new Date('2026-01-01T09:00:00.000Z')
      mockNitroHealth.saveBodyFat.mockResolvedValue(nativeUnknownWriteResult)

      await expect(NitroHealth.saveBodyFat([{ date, percentage: 0 }])).resolves.toEqual(
        unknownWriteResult
      )
      await expect(NitroHealth.saveBodyFat([{ date, percentage: 100 }])).resolves.toEqual(
        unknownWriteResult
      )
    })

    it('rejects an invalid sample date before crossing the native boundary', async () => {
      await expect(
        NitroHealth.saveBodyFat([{ date: new Date(Number.NaN), percentage: 18.5 }])
      ).rejects.toThrow('samples[0]: a valid date is required')

      expect(mockNitroHealth.saveBodyFat).not.toHaveBeenCalled()
    })
  })

  describe('saveLeanBodyMass', () => {
    it('saves through the Nitro hybrid object', async () => {
      const date = new Date('2026-01-01T09:00:00.000Z')
      mockNitroHealth.saveLeanBodyMass.mockResolvedValue(nativeUnknownWriteResult)

      await expect(NitroHealth.saveLeanBodyMass([{ date, kilograms: 55.4 }])).resolves.toEqual(
        unknownWriteResult
      )

      expect(mockNitroHealth.saveLeanBodyMass).toHaveBeenCalledWith([
        { timeMs: date.getTime(), kilograms: 55.4, writeMetadata: emptyWriteMetadata },
      ])
    })

    it('rejects non-positive kilograms before crossing the native boundary', async () => {
      const date = new Date('2026-01-01T09:00:00.000Z')

      for (const kilograms of [0, -1, Number.NaN, Number.NEGATIVE_INFINITY]) {
        await expect(NitroHealth.saveLeanBodyMass([{ date, kilograms }])).rejects.toThrow(
          'samples[0]: kilograms must be greater than 0'
        )
      }

      expect(mockNitroHealth.saveLeanBodyMass).not.toHaveBeenCalled()
    })

    it('rejects kilograms above the Health Connect ceiling', async () => {
      const date = new Date('2026-01-01T09:00:00.000Z')

      await expect(NitroHealth.saveLeanBodyMass([{ date, kilograms: 1000.1 }])).rejects.toThrow(
        'samples[0]: kilograms must not exceed 1000'
      )

      expect(mockNitroHealth.saveLeanBodyMass).not.toHaveBeenCalled()
    })

    it('rejects an invalid sample date before crossing the native boundary', async () => {
      await expect(
        NitroHealth.saveLeanBodyMass([{ date: new Date(Number.NaN), kilograms: 55.4 }])
      ).rejects.toThrow('samples[0]: a valid date is required')

      expect(mockNitroHealth.saveLeanBodyMass).not.toHaveBeenCalled()
    })
  })

  describe('saveBasalBodyTemperature', () => {
    it('saves through the Nitro hybrid object', async () => {
      const date = new Date('2026-01-01T06:30:00.000Z')
      mockNitroHealth.saveBasalBodyTemperature.mockResolvedValue(nativeUnknownWriteResult)

      await expect(
        NitroHealth.saveBasalBodyTemperature([{ date, celsius: 36.4 }])
      ).resolves.toEqual(unknownWriteResult)

      expect(mockNitroHealth.saveBasalBodyTemperature).toHaveBeenCalledWith([
        { timeMs: date.getTime(), celsius: 36.4, writeMetadata: emptyWriteMetadata },
      ])
    })

    it('maps temperature metadata through the same native transport', async () => {
      const date = new Date('2026-01-01T06:30:00.000Z')
      mockNitroHealth.saveBasalBodyTemperature.mockResolvedValue(nativeUnknownWriteResult)

      await NitroHealth.saveBasalBodyTemperature([
        {
          date,
          celsius: 36.4,
          metadata: {
            android: { measurementLocation: 'wrist' },
            ios: { sensorLocation: 'body' },
          },
        },
      ])

      expect(mockNitroHealth.saveBasalBodyTemperature).toHaveBeenCalledWith([
        {
          timeMs: date.getTime(),
          celsius: 36.4,
          writeMetadata: emptyWriteMetadata,
          androidMeasurementLocation: 'wrist',
          iosSensorLocation: 'body',
        },
      ])
    })

    it('rejects celsius outside 20-45 before crossing the native boundary', async () => {
      const date = new Date('2026-01-01T06:30:00.000Z')

      for (const celsius of [19, 45.1, Number.NaN, Number.POSITIVE_INFINITY]) {
        await expect(NitroHealth.saveBasalBodyTemperature([{ date, celsius }])).rejects.toThrow(
          'samples[0]: celsius must be between 20 and 45'
        )
      }

      expect(mockNitroHealth.saveBasalBodyTemperature).not.toHaveBeenCalled()
    })

    it('accepts the inclusive bound values', async () => {
      const date = new Date('2026-01-01T06:30:00.000Z')
      mockNitroHealth.saveBasalBodyTemperature.mockResolvedValue(nativeUnknownWriteResult)

      await expect(NitroHealth.saveBasalBodyTemperature([{ date, celsius: 20 }])).resolves.toEqual(
        unknownWriteResult
      )
      await expect(NitroHealth.saveBasalBodyTemperature([{ date, celsius: 45 }])).resolves.toEqual(
        unknownWriteResult
      )
    })

    it('rejects an invalid sample date before crossing the native boundary', async () => {
      await expect(
        NitroHealth.saveBasalBodyTemperature([{ date: new Date(Number.NaN), celsius: 36.4 }])
      ).rejects.toThrow('samples[0]: a valid date is required')

      expect(mockNitroHealth.saveBasalBodyTemperature).not.toHaveBeenCalled()
    })
  })

  describe('saveOxygenSaturation', () => {
    it('saves through the Nitro hybrid object', async () => {
      const date = new Date('2026-01-01T09:00:00.000Z')
      mockNitroHealth.saveOxygenSaturation.mockResolvedValue(nativeUnknownWriteResult)

      await expect(NitroHealth.saveOxygenSaturation([{ date, percentage: 97.5 }])).resolves.toEqual(
        unknownWriteResult
      )

      expect(mockNitroHealth.saveOxygenSaturation).toHaveBeenCalledWith([
        { timeMs: date.getTime(), percentage: 97.5, writeMetadata: emptyWriteMetadata },
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
      mockNitroHealth.saveOxygenSaturation.mockResolvedValue(nativeUnknownWriteResult)

      await expect(NitroHealth.saveOxygenSaturation([{ date, percentage: 0 }])).resolves.toEqual(
        unknownWriteResult
      )
      await expect(NitroHealth.saveOxygenSaturation([{ date, percentage: 100 }])).resolves.toEqual(
        unknownWriteResult
      )
    })
  })

  describe('saveHeight', () => {
    it('saves through the Nitro hybrid object', async () => {
      const date = new Date('2026-01-01T09:00:00.000Z')
      mockNitroHealth.saveHeight.mockResolvedValue(nativeUnknownWriteResult)

      await expect(NitroHealth.saveHeight([{ date, meters: 1.78 }])).resolves.toEqual(
        unknownWriteResult
      )

      expect(mockNitroHealth.saveHeight).toHaveBeenCalledWith([
        { timeMs: date.getTime(), meters: 1.78, writeMetadata: emptyWriteMetadata },
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

  describe('saveVo2Max', () => {
    it('saves through the Nitro hybrid object', async () => {
      const date = new Date('2026-01-01T09:00:00.000Z')
      mockNitroHealth.saveVo2Max.mockResolvedValue(nativeUnknownWriteResult)

      await expect(
        NitroHealth.saveVo2Max([{ date, millilitersPerKilogramPerMinute: 42.5 }])
      ).resolves.toEqual(unknownWriteResult)

      expect(mockNitroHealth.saveVo2Max).toHaveBeenCalledWith([
        {
          timeMs: date.getTime(),
          millilitersPerKilogramPerMinute: 42.5,
          writeMetadata: emptyWriteMetadata,
        },
      ])
    })

    it('rejects millilitersPerKilogramPerMinute outside 0-100 before crossing the native boundary', async () => {
      const date = new Date('2026-01-01T09:00:00.000Z')

      for (const millilitersPerKilogramPerMinute of [
        -1,
        100.1,
        Number.NaN,
        Number.POSITIVE_INFINITY,
      ]) {
        await expect(
          NitroHealth.saveVo2Max([{ date, millilitersPerKilogramPerMinute }])
        ).rejects.toThrow('samples[0]: millilitersPerKilogramPerMinute must be between 0 and 100')
      }

      expect(mockNitroHealth.saveVo2Max).not.toHaveBeenCalled()
    })

    it('maps both platform metadata scopes through the native transport', async () => {
      const date = new Date('2026-01-01T09:00:00.000Z')
      mockNitroHealth.saveVo2Max.mockResolvedValue(nativeUnknownWriteResult)

      await NitroHealth.saveVo2Max([
        {
          date,
          millilitersPerKilogramPerMinute: 42.5,
          metadata: {
            android: { measurementMethod: 'multistage_fitness_test' },
            ios: { testType: 'prediction_step_test' },
          },
        },
      ])

      expect(mockNitroHealth.saveVo2Max).toHaveBeenCalledWith([
        {
          timeMs: date.getTime(),
          millilitersPerKilogramPerMinute: 42.5,
          writeMetadata: emptyWriteMetadata,
          androidMeasurementMethod: 'multistageFitnessTest',
          iosTestType: 'predictionStepTest',
        },
      ])
    })

    it('rejects unsupported platform metadata before crossing the native boundary', async () => {
      const date = new Date('2026-01-01T09:00:00.000Z')

      await expect(
        NitroHealth.saveVo2Max([
          {
            date,
            millilitersPerKilogramPerMinute: 42.5,
            metadata: { ios: { testType: 'prediction_max_exercise' } },
          } as never,
        ])
      ).rejects.toThrow('samples[0]: metadata.ios.testType is unsupported')

      expect(mockNitroHealth.saveVo2Max).not.toHaveBeenCalled()
    })

    it('accepts the inclusive bound values', async () => {
      const date = new Date('2026-01-01T09:00:00.000Z')
      mockNitroHealth.saveVo2Max.mockResolvedValue(nativeUnknownWriteResult)

      await expect(
        NitroHealth.saveVo2Max([{ date, millilitersPerKilogramPerMinute: 0 }])
      ).resolves.toEqual(unknownWriteResult)
      await expect(
        NitroHealth.saveVo2Max([{ date, millilitersPerKilogramPerMinute: 100 }])
      ).resolves.toEqual(unknownWriteResult)
    })

    it('rejects an invalid sample date before crossing the native boundary', async () => {
      await expect(
        NitroHealth.saveVo2Max([
          { date: new Date(Number.NaN), millilitersPerKilogramPerMinute: 42.5 },
        ])
      ).rejects.toThrow('samples[0]: a valid date is required')

      expect(mockNitroHealth.saveVo2Max).not.toHaveBeenCalled()
    })
  })

  describe('saveFloorsClimbed', () => {
    it('saves through the Nitro hybrid object', async () => {
      const startDate = new Date('2026-01-01T09:00:00.000Z')
      const endDate = new Date('2026-01-01T09:30:00.000Z')
      mockNitroHealth.saveFloorsClimbed.mockResolvedValue(nativeUnknownWriteResult)

      await expect(
        NitroHealth.saveFloorsClimbed([{ startDate, endDate, floors: 12.5 }])
      ).resolves.toEqual(unknownWriteResult)

      expect(mockNitroHealth.saveFloorsClimbed).toHaveBeenCalledWith([
        {
          startTimeMs: startDate.getTime(),
          endTimeMs: endDate.getTime(),
          floors: 12.5,
          writeMetadata: emptyWriteMetadata,
        },
      ])
    })

    it('rejects negative or non-finite floors before crossing the native boundary', async () => {
      const startDate = new Date('2026-01-01T09:00:00.000Z')
      const endDate = new Date('2026-01-01T09:30:00.000Z')

      for (const floors of [-1, Number.NaN, Number.POSITIVE_INFINITY]) {
        await expect(
          NitroHealth.saveFloorsClimbed([{ startDate, endDate, floors }])
        ).rejects.toThrow('samples[0]: floors must be a non-negative number')
      }

      expect(mockNitroHealth.saveFloorsClimbed).not.toHaveBeenCalled()
    })

    it('accepts a zero-floor interval', async () => {
      const startDate = new Date('2026-01-01T09:00:00.000Z')
      const endDate = new Date('2026-01-01T09:30:00.000Z')
      mockNitroHealth.saveFloorsClimbed.mockResolvedValue(nativeUnknownWriteResult)

      await expect(
        NitroHealth.saveFloorsClimbed([{ startDate, endDate, floors: 0 }])
      ).resolves.toEqual(unknownWriteResult)
    })

    it('rejects an invalid sample interval before crossing the native boundary', async () => {
      const startDate = new Date('2026-01-01T09:30:00.000Z')
      const endDate = new Date('2026-01-01T09:00:00.000Z')

      await expect(
        NitroHealth.saveFloorsClimbed([{ startDate, endDate, floors: 12.5 }])
      ).rejects.toThrow('samples[0]: startDate must be before endDate')

      expect(mockNitroHealth.saveFloorsClimbed).not.toHaveBeenCalled()
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

    it('accepts sum for floorsClimbed', async () => {
      const startDate = new Date('2026-01-01T00:00:00.000Z')
      const endDate = new Date('2026-01-08T00:00:00.000Z')
      mockNitroHealth.readStatistics.mockResolvedValue([])

      await expect(
        NitroHealth.readStatistics('floorsClimbed', {
          startDate,
          endDate,
          bucket: 'day',
          metrics: ['sum'],
        })
      ).resolves.toEqual([])

      expect(mockNitroHealth.readStatistics).toHaveBeenCalledWith('floorsClimbed', {
        startTimeMs: startDate.getTime(),
        endTimeMs: endDate.getTime(),
        bucket: 'day',
        metrics: ['sum'],
      })
    })

    it("rejects 'avg' for floorsClimbed before crossing the native boundary", async () => {
      const startDate = new Date('2026-01-01T00:00:00.000Z')
      const endDate = new Date('2026-01-08T00:00:00.000Z')

      await expect(
        NitroHealth.readStatistics('floorsClimbed', {
          startDate,
          endDate,
          bucket: 'day',
          metrics: ['avg'],
        })
      ).rejects.toThrow(`Metric 'avg' is not supported for 'floorsClimbed' (supported: sum)`)

      expect(mockNitroHealth.readStatistics).not.toHaveBeenCalled()
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

    it('rejects respiratoryRate entirely before crossing the native boundary', async () => {
      const startDate = new Date('2026-01-01T00:00:00.000Z')
      const endDate = new Date('2026-01-08T00:00:00.000Z')

      await expect(
        NitroHealth.readStatistics('respiratoryRate', {
          startDate,
          endDate,
          bucket: 'day',
          metrics: ['avg'],
        })
      ).rejects.toThrow(`readStatistics does not support the 'respiratoryRate' data type`)

      expect(mockNitroHealth.readStatistics).not.toHaveBeenCalled()
    })

    it('rejects vo2Max entirely before crossing the native boundary', async () => {
      const startDate = new Date('2026-01-01T00:00:00.000Z')
      const endDate = new Date('2026-01-08T00:00:00.000Z')

      await expect(
        NitroHealth.readStatistics('vo2Max', {
          startDate,
          endDate,
          bucket: 'day',
          metrics: ['avg'],
        })
      ).rejects.toThrow(`readStatistics does not support the 'vo2Max' data type`)

      expect(mockNitroHealth.readStatistics).not.toHaveBeenCalled()
    })

    it('rejects bodyFat entirely before crossing the native boundary', async () => {
      const startDate = new Date('2026-01-01T00:00:00.000Z')
      const endDate = new Date('2026-01-08T00:00:00.000Z')

      await expect(
        NitroHealth.readStatistics('bodyFat', {
          startDate,
          endDate,
          bucket: 'day',
          metrics: ['avg'],
        })
      ).rejects.toThrow(`readStatistics does not support the 'bodyFat' data type`)

      expect(mockNitroHealth.readStatistics).not.toHaveBeenCalled()
    })

    it('rejects leanBodyMass entirely before crossing the native boundary', async () => {
      const startDate = new Date('2026-01-01T00:00:00.000Z')
      const endDate = new Date('2026-01-08T00:00:00.000Z')

      await expect(
        NitroHealth.readStatistics('leanBodyMass', {
          startDate,
          endDate,
          bucket: 'day',
          metrics: ['avg'],
        })
      ).rejects.toThrow(`readStatistics does not support the 'leanBodyMass' data type`)

      expect(mockNitroHealth.readStatistics).not.toHaveBeenCalled()
    })

    it('rejects basalBodyTemperature entirely before crossing the native boundary', async () => {
      const startDate = new Date('2026-01-01T00:00:00.000Z')
      const endDate = new Date('2026-01-08T00:00:00.000Z')

      await expect(
        NitroHealth.readStatistics('basalBodyTemperature', {
          startDate,
          endDate,
          bucket: 'day',
          metrics: ['avg'],
        })
      ).rejects.toThrow(`readStatistics does not support the 'basalBodyTemperature' data type`)

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
