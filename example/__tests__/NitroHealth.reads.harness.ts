import { describe, expect, it } from 'react-native-harness'
import { Platform } from 'react-native'
import { NitroHealth } from 'react-native-nitro-health'
import type { StepSample } from 'react-native-nitro-health'

import {
  activeEnergyReadPermission,
  bodyMassReadPermission,
  distanceReadPermission,
  emptyRange,
  hasVerifiedPermissions,
  heartRateReadPermission,
  heartRateVariabilityReadPermission,
  heightReadPermission,
  isInconclusiveRead,
  isPermissionUnnecessary,
  last7DaysRange,
  oxygenSaturationReadPermission,
  restingHeartRateReadPermission,
  saveReadRange,
  sleepReadPermission,
  stepsReadPermission,
  workoutReadPermission,
} from './support/harnessSupport'

describe('NitroHealth reads (native)', () => {
  it('reads steps from native code without crashing', async () => {
    try {
      const page = await NitroHealth.readSteps(emptyRange)

      expect(Array.isArray(page.samples)).toBe(true)
      expect(['string', 'undefined']).toContain(typeof page.nextCursor)
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('rejects reading steps on Android when permission is not granted', async () => {
    if (Platform.OS !== 'android') {
      return
    }

    const status = await NitroHealth.getRequestStatusForAuthorization(stepsReadPermission)

    if (status === 'unnecessary') {
      return
    }

    await expect(NitroHealth.readSteps(emptyRange)).rejects.toThrow(/permission/i)
  })

  it('rejects reading steps on iOS before authorization is requested (HealthKit notDetermined)', async () => {
    if (Platform.OS !== 'ios') {
      return
    }

    const status = await NitroHealth.getRequestStatusForAuthorization(stepsReadPermission)

    if (status === 'unnecessary') {
      return
    }

    await expect(NitroHealth.readSteps(emptyRange)).rejects.toThrow(/not determined/i)
  })

  it('reads daily step totals from native code without crashing', async () => {
    try {
      const totals = await NitroHealth.readDailyStepTotals(emptyRange)

      expect(Array.isArray(totals)).toBe(true)
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('rejects reading daily step totals on Android when permission is not granted', async () => {
    if (Platform.OS !== 'android') {
      return
    }

    const status = await NitroHealth.getRequestStatusForAuthorization(stepsReadPermission)

    if (status === 'unnecessary') {
      return
    }

    await expect(NitroHealth.readDailyStepTotals(emptyRange)).rejects.toThrow(/permission/i)
  })

  it('rejects reading daily step totals on iOS before authorization is requested (HealthKit notDetermined)', async () => {
    if (Platform.OS !== 'ios') {
      return
    }

    const status = await NitroHealth.getRequestStatusForAuthorization(stepsReadPermission)

    if (status === 'unnecessary') {
      return
    }

    await expect(NitroHealth.readDailyStepTotals(emptyRange)).rejects.toThrow(/not determined/i)
  })

  it('reads distance from native code without crashing', async () => {
    try {
      const page = await NitroHealth.readDistance(emptyRange)

      expect(Array.isArray(page.samples)).toBe(true)
      for (const sample of page.samples) {
        expect(typeof sample.uuid).toBe('string')
        expect(typeof sample.distanceMeters).toBe('number')
      }
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('rejects reading distance on Android when permission is not granted', async () => {
    if (Platform.OS !== 'android') {
      return
    }

    const status = await NitroHealth.getRequestStatusForAuthorization(distanceReadPermission)

    if (status === 'unnecessary') {
      return
    }

    await expect(NitroHealth.readDistance(emptyRange)).rejects.toThrow(/permission/i)
  })

  it('rejects reading distance on iOS before authorization is requested (HealthKit notDetermined)', async () => {
    if (Platform.OS !== 'ios') {
      return
    }

    const status = await NitroHealth.getRequestStatusForAuthorization(distanceReadPermission)

    if (status === 'unnecessary') {
      return
    }

    await expect(NitroHealth.readDistance(emptyRange)).rejects.toThrow(/not determined/i)
  })

  it('reads daily distance totals from native code without crashing', async () => {
    try {
      const totals = await NitroHealth.readDailyDistanceTotals(emptyRange)

      expect(Array.isArray(totals)).toBe(true)
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('rejects invalid activity quantity ranges before crossing the native boundary', async () => {
    const invalidRange = {
      startDate: new Date('2026-01-02T00:00:00.000Z'),
      endDate: new Date('2026-01-01T00:00:00.000Z'),
    }

    await expect(NitroHealth.readDistance(invalidRange)).rejects.toThrow(
      'startDate must be before endDate'
    )
    await expect(NitroHealth.readDailyDistanceTotals(invalidRange)).rejects.toThrow(
      'startDate must be before endDate'
    )
    await expect(NitroHealth.readActiveEnergyBurned(invalidRange)).rejects.toThrow(
      'startDate must be before endDate'
    )
    await expect(NitroHealth.readDailyActiveEnergyBurnedTotals(invalidRange)).rejects.toThrow(
      'startDate must be before endDate'
    )
  })

  it('rejects reading daily distance totals on Android when permission is not granted', async () => {
    if (Platform.OS !== 'android') {
      return
    }

    const status = await NitroHealth.getRequestStatusForAuthorization(distanceReadPermission)

    if (status === 'unnecessary') {
      return
    }

    await expect(NitroHealth.readDailyDistanceTotals(emptyRange)).rejects.toThrow(/permission/i)
  })

  it('reads active energy burned from native code without crashing', async () => {
    try {
      const page = await NitroHealth.readActiveEnergyBurned(emptyRange)

      expect(Array.isArray(page.samples)).toBe(true)
      for (const sample of page.samples) {
        expect(typeof sample.kilocalories).toBe('number')
      }
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('rejects reading active energy burned on Android when permission is not granted', async () => {
    if (Platform.OS !== 'android') {
      return
    }

    const status = await NitroHealth.getRequestStatusForAuthorization(activeEnergyReadPermission)

    if (status === 'unnecessary') {
      return
    }

    await expect(NitroHealth.readActiveEnergyBurned(emptyRange)).rejects.toThrow(/permission/i)
  })

  it('rejects reading active energy burned on iOS before authorization is requested (HealthKit notDetermined)', async () => {
    if (Platform.OS !== 'ios') {
      return
    }

    const status = await NitroHealth.getRequestStatusForAuthorization(activeEnergyReadPermission)

    if (status === 'unnecessary') {
      return
    }

    await expect(NitroHealth.readActiveEnergyBurned(emptyRange)).rejects.toThrow(/not determined/i)
  })

  it('reads daily active energy burned totals from native code without crashing', async () => {
    try {
      const totals = await NitroHealth.readDailyActiveEnergyBurnedTotals(emptyRange)

      expect(Array.isArray(totals)).toBe(true)
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('rejects reading daily active energy burned totals on Android when permission is not granted', async () => {
    if (Platform.OS !== 'android') {
      return
    }

    const status = await NitroHealth.getRequestStatusForAuthorization(activeEnergyReadPermission)

    if (status === 'unnecessary') {
      return
    }

    await expect(NitroHealth.readDailyActiveEnergyBurnedTotals(emptyRange)).rejects.toThrow(
      /permission/i
    )
  })

  it('reads heart rate from native code without crashing', async () => {
    try {
      const page = await NitroHealth.readHeartRate(emptyRange)

      expect(Array.isArray(page.samples)).toBe(true)
      for (const sample of page.samples) {
        expect(typeof sample.uuid).toBe('string')
        expect(typeof sample.bpm).toBe('number')
        expect(['string', 'undefined']).toContain(typeof sample.source)
      }
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('reads body mass from native code without crashing', async () => {
    try {
      const page = await NitroHealth.readBodyMass(emptyRange)

      expect(Array.isArray(page.samples)).toBe(true)
      for (const sample of page.samples) {
        expect(typeof sample.kilograms).toBe('number')
        expect(['string', 'undefined']).toContain(typeof sample.source)
      }
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('rejects reading body mass on Android when permission is not granted', async () => {
    if (Platform.OS !== 'android') {
      return
    }

    const status = await NitroHealth.getRequestStatusForAuthorization(bodyMassReadPermission)

    if (status === 'unnecessary') {
      return
    }

    await expect(NitroHealth.readBodyMass(emptyRange)).rejects.toThrow(/permission/i)
  })

  it('rejects reading body mass on iOS before authorization is requested (HealthKit notDetermined)', async () => {
    if (Platform.OS !== 'ios') {
      return
    }

    const status = await NitroHealth.getRequestStatusForAuthorization(bodyMassReadPermission)

    if (status === 'unnecessary') {
      return
    }

    await expect(NitroHealth.readBodyMass(emptyRange)).rejects.toThrow(/not determined/i)
  })

  it('rejects reading heart rate on Android when permission is not granted', async () => {
    if (Platform.OS !== 'android') {
      return
    }

    const status = await NitroHealth.getRequestStatusForAuthorization(heartRateReadPermission)

    if (status === 'unnecessary') {
      return
    }

    await expect(NitroHealth.readHeartRate(emptyRange)).rejects.toThrow(/permission/i)
  })

  it('rejects reading heart rate on iOS before authorization is requested (HealthKit notDetermined)', async () => {
    if (Platform.OS !== 'ios') {
      return
    }

    const status = await NitroHealth.getRequestStatusForAuthorization(heartRateReadPermission)

    if (status === 'unnecessary') {
      return
    }

    await expect(NitroHealth.readHeartRate(emptyRange)).rejects.toThrow(/not determined/i)
  })

  it('reads sleep samples from native code without crashing', async () => {
    try {
      const page = await NitroHealth.readSleepSamples(emptyRange)

      expect(Array.isArray(page.samples)).toBe(true)
      for (const sample of page.samples) {
        expect(sample.startDate).toBeInstanceOf(Date)
        expect(sample.endDate).toBeInstanceOf(Date)
        expect(typeof sample.stage).toBe('string')
        expect(['string', 'undefined']).toContain(typeof sample.source)
      }
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('rejects reading sleep samples on Android when permission is not granted', async () => {
    if (Platform.OS !== 'android') {
      return
    }

    const status = await NitroHealth.getRequestStatusForAuthorization(sleepReadPermission)

    if (status === 'unnecessary') {
      return
    }

    await expect(NitroHealth.readSleepSamples(emptyRange)).rejects.toThrow(/permission/i)
  })

  it('rejects reading sleep samples on iOS before authorization is requested (HealthKit notDetermined)', async () => {
    if (Platform.OS !== 'ios') {
      return
    }

    const status = await NitroHealth.getRequestStatusForAuthorization(sleepReadPermission)

    if (status === 'unnecessary') {
      return
    }

    await expect(NitroHealth.readSleepSamples(emptyRange)).rejects.toThrow(/not determined/i)
  })

  it('reads workouts from native code without crashing', async () => {
    try {
      const page = await NitroHealth.readWorkouts(emptyRange)

      expect(Array.isArray(page.samples)).toBe(true)
      for (const workout of page.samples) {
        expect(typeof workout.uuid).toBe('string')
        expect(workout.startDate).toBeInstanceOf(Date)
        expect(workout.endDate).toBeInstanceOf(Date)
        expect(typeof workout.durationSeconds).toBe('number')
        expect(typeof workout.activityType).toBe('string')
        expect(['string', 'undefined']).toContain(typeof workout.title)
        expect(['string', 'undefined']).toContain(typeof workout.source)
        expect(['number', 'undefined']).toContain(typeof workout.totalDistanceMeters)
        expect(['number', 'undefined']).toContain(typeof workout.totalEnergyBurnedKcal)
      }
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('rejects reading workouts on Android when permission is not granted', async () => {
    if (Platform.OS !== 'android') {
      return
    }

    const status = await NitroHealth.getRequestStatusForAuthorization(workoutReadPermission)

    if (status === 'unnecessary') {
      return
    }

    await expect(NitroHealth.readWorkouts(emptyRange)).rejects.toThrow(/permission/i)
  })

  it('rejects reading workouts on iOS before authorization is requested (HealthKit notDetermined)', async () => {
    if (Platform.OS !== 'ios') {
      return
    }

    const status = await NitroHealth.getRequestStatusForAuthorization(workoutReadPermission)

    if (status === 'unnecessary') {
      return
    }

    await expect(NitroHealth.readWorkouts(emptyRange)).rejects.toThrow(/not determined/i)
  })

  describe('resting heart rate', () => {
    it('reads resting heart rate from native code without crashing', async () => {
      try {
        const page = await NitroHealth.readRestingHeartRate(emptyRange)

        expect(Array.isArray(page.samples)).toBe(true)
        for (const sample of page.samples) {
          expect(typeof sample.bpm).toBe('number')
          expect(['string', 'undefined']).toContain(typeof sample.source)
        }
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
      }
    })

    it('rejects reading resting heart rate on Android when permission is not granted', async () => {
      if (Platform.OS !== 'android') {
        return
      }

      const status = await NitroHealth.getRequestStatusForAuthorization(
        restingHeartRateReadPermission
      )

      if (status === 'unnecessary') {
        return
      }

      await expect(NitroHealth.readRestingHeartRate(emptyRange)).rejects.toThrow(/permission/i)
    })

    it('rejects reading resting heart rate on iOS before authorization is requested (HealthKit notDetermined)', async () => {
      if (Platform.OS !== 'ios') {
        return
      }

      const status = await NitroHealth.getRequestStatusForAuthorization(
        restingHeartRateReadPermission
      )

      if (status === 'unnecessary') {
        return
      }

      await expect(NitroHealth.readRestingHeartRate(emptyRange)).rejects.toThrow(/not determined/i)
    })
  })

  // HRV has no save method: SDNN (iOS) and RMSSD (Android) are different, non-comparable
  // measures, so there is no single value that would be correct to write on both platforms
  // (see HeartRateVariabilitySample doc comment). Only reads exist for HRV.
  describe('heart rate variability', () => {
    it('reads heart rate variability from native code without crashing', async () => {
      try {
        const page = await NitroHealth.readHeartRateVariability(emptyRange)

        expect(Array.isArray(page.samples)).toBe(true)
        for (const sample of page.samples) {
          expect(typeof sample.milliseconds).toBe('number')
          expect(['sdnn', 'rmssd']).toContain(sample.method)
          expect(['string', 'undefined']).toContain(typeof sample.source)
        }
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
      }
    })

    it('rejects reading heart rate variability on Android when permission is not granted', async () => {
      if (Platform.OS !== 'android') {
        return
      }

      const status = await NitroHealth.getRequestStatusForAuthorization(
        heartRateVariabilityReadPermission
      )

      if (status === 'unnecessary') {
        return
      }

      await expect(NitroHealth.readHeartRateVariability(emptyRange)).rejects.toThrow(/permission/i)
    })

    it('rejects reading heart rate variability on iOS before authorization is requested (HealthKit notDetermined)', async () => {
      if (Platform.OS !== 'ios') {
        return
      }

      const status = await NitroHealth.getRequestStatusForAuthorization(
        heartRateVariabilityReadPermission
      )

      if (status === 'unnecessary') {
        return
      }

      await expect(NitroHealth.readHeartRateVariability(emptyRange)).rejects.toThrow(
        /not determined/i
      )
    })

    // The designated proof that `method` discriminates correctly per platform: iOS always
    // reports HealthKit's SDNN metric, Android always reports Health Connect's RMSSD metric.
    // SDNN and RMSSD are non-comparable, so this field must never disagree with Platform.OS.
    it('reports the method matching this platform (SDNN on iOS, RMSSD on Android) when samples are returned', async () => {
      if (!(await isPermissionUnnecessary(heartRateVariabilityReadPermission))) {
        return
      }

      const page = await NitroHealth.readHeartRateVariability(last7DaysRange)

      if (isInconclusiveRead(page.samples)) {
        return
      }

      const expectedMethod = Platform.OS === 'ios' ? 'sdnn' : 'rmssd'
      for (const sample of page.samples) {
        expect(sample.method).toBe(expectedMethod)
      }
    })
  })

  describe('oxygen saturation', () => {
    it('reads oxygen saturation from native code without crashing', async () => {
      try {
        const page = await NitroHealth.readOxygenSaturation(emptyRange)

        expect(Array.isArray(page.samples)).toBe(true)
        for (const sample of page.samples) {
          expect(typeof sample.percentage).toBe('number')
          expect(sample.percentage).toBeGreaterThanOrEqual(0)
          expect(sample.percentage).toBeLessThanOrEqual(100)
          expect(['string', 'undefined']).toContain(typeof sample.source)
        }
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
      }
    })

    it('rejects reading oxygen saturation on Android when permission is not granted', async () => {
      if (Platform.OS !== 'android') {
        return
      }

      const status = await NitroHealth.getRequestStatusForAuthorization(
        oxygenSaturationReadPermission
      )

      if (status === 'unnecessary') {
        return
      }

      await expect(NitroHealth.readOxygenSaturation(emptyRange)).rejects.toThrow(/permission/i)
    })

    it('rejects reading oxygen saturation on iOS before authorization is requested (HealthKit notDetermined)', async () => {
      if (Platform.OS !== 'ios') {
        return
      }

      const status = await NitroHealth.getRequestStatusForAuthorization(
        oxygenSaturationReadPermission
      )

      if (status === 'unnecessary') {
        return
      }

      await expect(NitroHealth.readOxygenSaturation(emptyRange)).rejects.toThrow(/not determined/i)
    })
  })

  describe('height', () => {
    it('reads height from native code without crashing', async () => {
      try {
        const page = await NitroHealth.readHeight(emptyRange)

        expect(Array.isArray(page.samples)).toBe(true)
        for (const sample of page.samples) {
          expect(typeof sample.meters).toBe('number')
          expect(['string', 'undefined']).toContain(typeof sample.source)
        }
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
      }
    })

    it('rejects reading height on Android when permission is not granted', async () => {
      if (Platform.OS !== 'android') {
        return
      }

      const status = await NitroHealth.getRequestStatusForAuthorization(heightReadPermission)

      if (status === 'unnecessary') {
        return
      }

      await expect(NitroHealth.readHeight(emptyRange)).rejects.toThrow(/permission/i)
    })

    it('rejects reading height on iOS before authorization is requested (HealthKit notDetermined)', async () => {
      if (Platform.OS !== 'ios') {
        return
      }

      const status = await NitroHealth.getRequestStatusForAuthorization(heightReadPermission)

      if (status === 'unnecessary') {
        return
      }

      await expect(NitroHealth.readHeight(emptyRange)).rejects.toThrow(/not determined/i)
    })
  })

  describe('pagination', () => {
    // Five distinct intervals inside saveReadRange (the fixed synthetic day the save suite
    // also uses). Harness runs accumulate samples in this range, so assertions compare a
    // paged walk against a single big read instead of expecting exact totals.
    const pagingIntervals = [10, 11, 12, 13, 14].map((hour) => ({
      startDate: new Date(`2001-06-01T${hour}:00:00.000Z`),
      endDate: new Date(`2001-06-01T${hour}:30:00.000Z`),
    }))

    it('walks step pages to exhaustion without duplicating or dropping samples', async () => {
      const authorized = await hasVerifiedPermissions([
        { accessType: 'write', dataType: 'steps' },
        { accessType: 'read', dataType: 'steps' },
      ])

      if (!authorized) {
        return
      }

      await NitroHealth.saveSteps(
        pagingIntervals.map((interval, index) => ({ ...interval, count: 100 + index }))
      )

      const fullPage = await NitroHealth.readSteps({ ...saveReadRange, limit: 1000 })

      if (isInconclusiveRead(fullPage.samples)) {
        return
      }

      expect(fullPage.nextCursor).toBeUndefined()
      expect(fullPage.samples.length).toBeGreaterThanOrEqual(pagingIntervals.length)

      const collected: StepSample[] = []
      let cursor: string | undefined
      let pages = 0
      const maxPages = Math.ceil(fullPage.samples.length / 2) + 3

      do {
        const page = await NitroHealth.readSteps({ ...saveReadRange, limit: 2, cursor })

        collected.push(...page.samples)
        cursor = page.nextCursor
        pages += 1

        if (cursor !== undefined) {
          expect(page.samples.length).toBe(2)
        }
      } while (cursor !== undefined && pages < maxPages)

      expect(cursor).toBeUndefined()
      expect(collected.length).toBe(fullPage.samples.length)
      expect(new Set(collected.map((sample) => sample.uuid)).size).toBe(collected.length)
    })

    it('rejects a garbage cursor with a descriptive error', async () => {
      if (!(await hasVerifiedPermissions(stepsReadPermission))) {
        return
      }

      await expect(
        NitroHealth.readSteps({ ...saveReadRange, cursor: 'not-a-real-cursor' })
      ).rejects.toThrow(/invalid cursor/i)
    })
  })
})
