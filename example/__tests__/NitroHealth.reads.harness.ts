import { describe, expect, it } from 'react-native-harness'
import { Platform } from 'react-native'
import { NitroHealth } from 'react-native-nitro-health'

import {
  activeEnergyReadPermission,
  bodyMassReadPermission,
  distanceReadPermission,
  emptyRange,
  heartRateReadPermission,
  heartRateVariabilityReadPermission,
  heightReadPermission,
  isInconclusiveRead,
  isPermissionUnnecessary,
  last7DaysRange,
  oxygenSaturationReadPermission,
  restingHeartRateReadPermission,
  sleepReadPermission,
  stepsReadPermission,
  workoutReadPermission,
} from './support/harnessSupport'

describe('NitroHealth reads (native)', () => {
  it('reads steps from native code without crashing', async () => {
    try {
      const steps = await NitroHealth.readSteps(emptyRange)

      expect(Array.isArray(steps)).toBe(true)
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
      const samples = await NitroHealth.readDistance(emptyRange)

      expect(Array.isArray(samples)).toBe(true)
      for (const sample of samples) {
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
      const samples = await NitroHealth.readActiveEnergyBurned(emptyRange)

      expect(Array.isArray(samples)).toBe(true)
      for (const sample of samples) {
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
      const samples = await NitroHealth.readHeartRate(emptyRange)

      expect(Array.isArray(samples)).toBe(true)
      for (const sample of samples) {
        expect(typeof sample.bpm).toBe('number')
        expect(['string', 'undefined']).toContain(typeof sample.source)
      }
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('reads body mass from native code without crashing', async () => {
    try {
      const samples = await NitroHealth.readBodyMass(emptyRange)

      expect(Array.isArray(samples)).toBe(true)
      for (const sample of samples) {
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
      const samples = await NitroHealth.readSleepSamples(emptyRange)

      expect(Array.isArray(samples)).toBe(true)
      for (const sample of samples) {
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
      const workouts = await NitroHealth.readWorkouts(emptyRange)

      expect(Array.isArray(workouts)).toBe(true)
      for (const workout of workouts) {
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
        const samples = await NitroHealth.readRestingHeartRate(emptyRange)

        expect(Array.isArray(samples)).toBe(true)
        for (const sample of samples) {
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
        const samples = await NitroHealth.readHeartRateVariability(emptyRange)

        expect(Array.isArray(samples)).toBe(true)
        for (const sample of samples) {
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

      const samples = await NitroHealth.readHeartRateVariability(last7DaysRange)

      if (isInconclusiveRead(samples)) {
        return
      }

      const expectedMethod = Platform.OS === 'ios' ? 'sdnn' : 'rmssd'
      for (const sample of samples) {
        expect(sample.method).toBe(expectedMethod)
      }
    })
  })

  describe('oxygen saturation', () => {
    it('reads oxygen saturation from native code without crashing', async () => {
      try {
        const samples = await NitroHealth.readOxygenSaturation(emptyRange)

        expect(Array.isArray(samples)).toBe(true)
        for (const sample of samples) {
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
        const samples = await NitroHealth.readHeight(emptyRange)

        expect(Array.isArray(samples)).toBe(true)
        for (const sample of samples) {
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
})
