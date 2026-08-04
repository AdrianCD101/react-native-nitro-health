import { describe, expect, it } from 'react-native-harness'
import { NitroHealth } from 'react-native-nitro-health'

import {
  hasVerifiedPermissions,
  isInconclusiveRead,
  saveInterval,
  saveReadRange,
} from './support/harnessSupport'

describe('NitroHealth saves (native)', () => {
  it('rejects empty save sample arrays before crossing the native boundary', async () => {
    await expect(NitroHealth.saveSteps([])).rejects.toThrow('At least one sample is required')
    await expect(NitroHealth.saveDistance([])).rejects.toThrow('At least one sample is required')
    await expect(NitroHealth.saveActiveEnergyBurned([])).rejects.toThrow(
      'At least one sample is required'
    )
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
      NitroHealth.saveDistance([{ ...saveInterval, distanceMeters: -1 }])
    ).rejects.toThrow('samples[0]: distanceMeters must be a non-negative number')
    await expect(
      NitroHealth.saveActiveEnergyBurned([{ ...saveInterval, kilocalories: -1 }])
    ).rejects.toThrow('samples[0]: kilocalories must be a non-negative number')
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

  it('rejects saving steps when write permission is not granted', async () => {
    if (await hasVerifiedPermissions([{ accessType: 'write', dataType: 'steps' }])) {
      return
    }

    await expect(NitroHealth.saveSteps([{ ...saveInterval, count: 100 }])).rejects.toThrow(
      /permission/i
    )
  })

  it('rejects saving distance when write permission is not granted', async () => {
    if (await hasVerifiedPermissions([{ accessType: 'write', dataType: 'distance' }])) {
      return
    }

    await expect(
      NitroHealth.saveDistance([{ ...saveInterval, distanceMeters: 1000 }])
    ).rejects.toThrow(/permission/i)
  })

  it('rejects saving active energy burned when write permission is not granted', async () => {
    if (await hasVerifiedPermissions([{ accessType: 'write', dataType: 'activeEnergyBurned' }])) {
      return
    }

    await expect(
      NitroHealth.saveActiveEnergyBurned([{ ...saveInterval, kilocalories: 100 }])
    ).rejects.toThrow(/permission/i)
  })

  it('rejects saving heart rate when write permission is not granted', async () => {
    if (await hasVerifiedPermissions([{ accessType: 'write', dataType: 'heartRate' }])) {
      return
    }

    await expect(
      NitroHealth.saveHeartRate([{ date: saveInterval.startDate, bpm: 72 }])
    ).rejects.toThrow(/permission/i)
  })

  it('rejects saving body mass when write permission is not granted', async () => {
    if (await hasVerifiedPermissions([{ accessType: 'write', dataType: 'bodyMass' }])) {
      return
    }

    await expect(
      NitroHealth.saveBodyMass([{ date: saveInterval.startDate, kilograms: 72.5 }])
    ).rejects.toThrow(/permission/i)
  })

  it('rejects saving sleep when write permission is not granted', async () => {
    if (await hasVerifiedPermissions([{ accessType: 'write', dataType: 'sleep' }])) {
      return
    }

    await expect(
      NitroHealth.saveSleepSessions([{ ...saveInterval, timeZone: 'UTC' }])
    ).rejects.toThrow(/permission/i)
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

    await NitroHealth.deleteSamplesByTimeRange('sleep', saveReadRange)
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

      expect(
        page.samples.some(
          (sample) =>
            sample.stage === 'asleepCore' &&
            sample.startDate.getTime() === saveInterval.startDate.getTime() &&
            sample.endDate.getTime() === middleDate.getTime()
        )
      ).toBe(true)
      expect(
        page.samples.some(
          (sample) =>
            sample.stage === 'asleepDeep' &&
            sample.startDate.getTime() === middleDate.getTime() &&
            sample.endDate.getTime() === saveInterval.endDate.getTime()
        )
      ).toBe(true)
    } finally {
      await NitroHealth.deleteSamplesByTimeRange('sleep', saveReadRange)
    }
  })

  describe('resting heart rate', () => {
    it('rejects saving resting heart rate when write permission is not granted', async () => {
      if (await hasVerifiedPermissions([{ accessType: 'write', dataType: 'restingHeartRate' }])) {
        return
      }

      await expect(
        NitroHealth.saveRestingHeartRate([{ date: saveInterval.startDate, bpm: 58 }])
      ).rejects.toThrow(/permission/i)
    })

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
    it('rejects saving oxygen saturation when write permission is not granted', async () => {
      if (await hasVerifiedPermissions([{ accessType: 'write', dataType: 'oxygenSaturation' }])) {
        return
      }

      await expect(
        NitroHealth.saveOxygenSaturation([{ date: saveInterval.startDate, percentage: 97.5 }])
      ).rejects.toThrow(/permission/i)
    })

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

  describe('height', () => {
    it('rejects saving height when write permission is not granted', async () => {
      if (await hasVerifiedPermissions([{ accessType: 'write', dataType: 'height' }])) {
        return
      }

      await expect(
        NitroHealth.saveHeight([{ date: saveInterval.startDate, meters: 1.78 }])
      ).rejects.toThrow(/permission/i)
    })

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
