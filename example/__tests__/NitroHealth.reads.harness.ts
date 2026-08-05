import { Platform } from 'react-native'
import { describe, expect, it } from 'react-native-harness'
import { NitroHealth } from 'react-native-nitro-health'
import type {
  HealthMetricValue,
  HealthPermission,
  HealthSample,
  StepSample,
} from 'react-native-nitro-health'

import {
  emptyRange,
  hasReadablePermission,
  hasVerifiedPermissions,
  heartRateVariabilityReadPermission,
  isInconclusiveRead,
  last7DaysRange,
  saveReadRange,
  stepsReadPermission,
} from './support/harnessSupport'

function assertSampleIdentityAndOrigin(sample: HealthSample): void {
  expect(['record', 'record-child']).toContain(sample.identity.kind)
  expect(typeof sample.identity.id).toBe('string')
  expect(sample.identity.id.length).toBeGreaterThan(0)
  if (sample.identity.kind === 'record-child') {
    expect(sample.identity.record.kind).toBe('record')
    expect(typeof sample.identity.record.id).toBe('string')
    expect(sample.identity.record.id.length).toBeGreaterThan(0)
  }

  expect(typeof sample.origin.identifier).toBe('string')
  expect(sample.origin.identifier.length).toBeGreaterThan(0)
  expect(['string', 'undefined']).toContain(typeof sample.origin.displayName)
}

function assertMetric(metric: HealthMetricValue): void {
  expect(['available', 'not-reported', 'unsupported']).toContain(metric.status)
  if (metric.status === 'available') {
    expect(typeof metric.value).toBe('number')
    expect(Number.isFinite(metric.value)).toBe(true)
  }
}

async function assertReadRejectedWhenReportedDenied(
  permissions: HealthPermission[],
  operation: () => Promise<unknown>
): Promise<void> {
  const result = await NitroHealth.getPermissionStatuses(permissions)
  if (
    result.status === 'unavailable' ||
    !result.statuses.some(({ status }) => status === 'notGranted')
  ) {
    return
  }

  await expect(operation()).rejects.toThrow(/permission/i)
}

describe('NitroHealth reads (native)', () => {
  it('reads steps and reports denied reads through typed permission state', async () => {
    try {
      const page = await NitroHealth.readSteps(emptyRange)
      expect(Array.isArray(page.samples)).toBe(true)
      expect(['string', 'undefined']).toContain(typeof page.nextCursor)
      page.samples.forEach(assertSampleIdentityAndOrigin)
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }

    await assertReadRejectedWhenReportedDenied(stepsReadPermission, () =>
      NitroHealth.readSteps(emptyRange)
    )
  })

  it('reads distance with identity, source identifier, and semantic scope', async () => {
    try {
      const page = await NitroHealth.readDistance(emptyRange)

      expect(Array.isArray(page.samples)).toBe(true)
      for (const sample of page.samples) {
        assertSampleIdentityAndOrigin(sample)
        expect(typeof sample.distanceMeters).toBe('number')
        expect(['walking-running', 'activity-unspecified']).toContain(sample.scope)
      }
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }

    await assertReadRejectedWhenReportedDenied(
      [{ accessType: 'read', dataType: 'distance' }],
      () => NitroHealth.readDistance(emptyRange)
    )
  })

  it('rejects invalid activity quantity ranges before crossing the native boundary', async () => {
    const invalidRange = {
      startDate: new Date('2026-01-02T00:00:00.000Z'),
      endDate: new Date('2026-01-01T00:00:00.000Z'),
    }

    await expect(NitroHealth.readDistance(invalidRange)).rejects.toThrow(
      'startDate must be before endDate'
    )
    await expect(NitroHealth.readActiveEnergyBurned(invalidRange)).rejects.toThrow(
      'startDate must be before endDate'
    )
  })

  it('reads active energy, heart rate, and body mass with identity and origin', async () => {
    try {
      const page = await NitroHealth.readActiveEnergyBurned(emptyRange)
      for (const sample of page.samples) {
        assertSampleIdentityAndOrigin(sample)
        expect(typeof sample.kilocalories).toBe('number')
      }
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }

    try {
      const page = await NitroHealth.readHeartRate(emptyRange)
      for (const sample of page.samples) {
        assertSampleIdentityAndOrigin(sample)
        expect(typeof sample.bpm).toBe('number')
      }
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }

    try {
      const page = await NitroHealth.readBodyMass(emptyRange)
      for (const sample of page.samples) {
        assertSampleIdentityAndOrigin(sample)
        expect(typeof sample.kilograms).toBe('number')
      }
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('returns tagged stage-less sleep envelopes and explicit sleep stages', async () => {
    try {
      const page = await NitroHealth.readSleepSamples(emptyRange)

      expect(Array.isArray(page.samples)).toBe(true)
      for (const sample of page.samples) {
        assertSampleIdentityAndOrigin(sample)
        expect(sample.startDate).toBeInstanceOf(Date)
        expect(sample.endDate).toBeInstanceOf(Date)
        if (sample.kind === 'session-envelope') {
          expect(['reported', 'not-reported', 'unverifiable']).toContain(sample.stageData)
          expect('stage' in sample).toBe(false)
        } else {
          expect(typeof sample.stage).toBe('string')
          if (sample.identity.kind === 'record-child') {
            expect(sample.identity.record.id.length).toBeGreaterThan(0)
          }
        }
      }
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('reads semantic workout activity, durations, metadata, and totals', async () => {
    try {
      const page = await NitroHealth.readWorkouts(emptyRange)

      expect(Array.isArray(page.samples)).toBe(true)
      for (const workout of page.samples) {
        assertSampleIdentityAndOrigin(workout)
        expect(workout.startDate).toBeInstanceOf(Date)
        expect(workout.endDate).toBeInstanceOf(Date)
        expect(typeof workout.elapsedDurationSeconds).toBe('number')
        expect(workout.elapsedDurationSeconds).toBeGreaterThanOrEqual(0)
        assertMetric(workout.activeDuration)
        if (workout.activity.status === 'known') {
          expect(typeof workout.activity.type).toBe('string')
          expect(['portable', 'read-only']).toContain(workout.activity.portability)
          expect(['exact', 'broadened']).toContain(workout.activity.mapping)
        } else {
          expect(workout.activity).toEqual({ status: 'unknown' })
        }
        expect(['string', 'undefined']).toContain(typeof workout.title)
        expect(['string', 'undefined']).toContain(typeof workout.brandName)
        assertMetric(workout.totalDistance)
        assertMetric(workout.totalActiveEnergyBurned)
      }
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('reads resting heart rate, HRV, oxygen saturation, and height with origins', async () => {
    try {
      const page = await NitroHealth.readRestingHeartRate(emptyRange)
      for (const sample of page.samples) {
        assertSampleIdentityAndOrigin(sample)
        expect(typeof sample.bpm).toBe('number')
      }
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }

    try {
      const page = await NitroHealth.readHeartRateVariability(emptyRange)
      for (const sample of page.samples) {
        assertSampleIdentityAndOrigin(sample)
        expect(typeof sample.milliseconds).toBe('number')
        expect(['sdnn', 'rmssd']).toContain(sample.method)
      }
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }

    try {
      const page = await NitroHealth.readOxygenSaturation(emptyRange)
      for (const sample of page.samples) {
        assertSampleIdentityAndOrigin(sample)
        expect(sample.percentage).toBeGreaterThanOrEqual(0)
        expect(sample.percentage).toBeLessThanOrEqual(100)
      }
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }

    try {
      const page = await NitroHealth.readHeight(emptyRange)
      for (const sample of page.samples) {
        assertSampleIdentityAndOrigin(sample)
        expect(typeof sample.meters).toBe('number')
      }
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })

  // SDNN and RMSSD are non-comparable, so this assertion intentionally verifies the native
  // implementation detail for each platform after public permission state allows the read.
  it('reports SDNN on iOS and RMSSD on Android when HRV samples are observable', async () => {
    if (!(await hasReadablePermission(heartRateVariabilityReadPermission))) return

    let page: Awaited<ReturnType<typeof NitroHealth.readHeartRateVariability>>
    try {
      page = await NitroHealth.readHeartRateVariability(last7DaysRange)
    } catch (error) {
      if (Platform.OS === 'ios') {
        expect(error).toBeInstanceOf(Error)
        return
      }
      throw error
    }
    if (isInconclusiveRead(page.samples)) return

    const expectedMethod = Platform.OS === 'ios' ? 'sdnn' : 'rmssd'
    for (const sample of page.samples) {
      expect(sample.method).toBe(expectedMethod)
    }
  })

  describe('pagination', () => {
    const pagingIntervals = [10, 11, 12, 13, 14].map((hour) => ({
      startDate: new Date(`2001-06-01T${hour}:00:00.000Z`),
      endDate: new Date(`2001-06-01T${hour}:30:00.000Z`),
    }))

    it('walks step pages to exhaustion without duplicating or dropping identities', async () => {
      const authorized = await hasVerifiedPermissions([
        { accessType: 'write', dataType: 'steps' },
        { accessType: 'read', dataType: 'steps' },
      ])
      if (!authorized) return

      await NitroHealth.saveSteps(
        pagingIntervals.map((interval, index) => ({ ...interval, count: 100 + index }))
      )

      const fullPage = await NitroHealth.readSteps({ ...saveReadRange, limit: 1000 })
      if (isInconclusiveRead(fullPage.samples)) return

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
        if (cursor !== undefined) expect(page.samples.length).toBe(2)
      } while (cursor !== undefined && pages < maxPages)

      expect(cursor).toBeUndefined()
      expect(collected.length).toBe(fullPage.samples.length)
      expect(new Set(collected.map((sample) => sample.identity.id)).size).toBe(collected.length)
    })

    it('rejects a garbage cursor with a descriptive error', async () => {
      if (!(await hasReadablePermission(stepsReadPermission))) return

      await expect(
        NitroHealth.readSteps({ ...saveReadRange, cursor: 'not-a-real-cursor' })
      ).rejects.toThrow(/invalid cursor/i)
    })
  })
})
