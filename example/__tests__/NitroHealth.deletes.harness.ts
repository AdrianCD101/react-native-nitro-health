import { describe, expect, it } from 'react-native-harness'
import { NitroHealth } from 'react-native-nitro-health'
import type { HealthRecordChildIdentity, HealthRecordIdentity } from 'react-native-nitro-health'

import {
  deleteInterval,
  deleteReadRange,
  emptyRange,
  hasVerifiedPermissions,
  assertConclusiveRead,
} from './support/harnessSupport'

const nonexistentRecord: HealthRecordIdentity = {
  kind: 'record',
  id: '00000000-0000-4000-8000-000000000000',
}

function assertCompletedIdentityDelete(
  result: Awaited<ReturnType<typeof NitroHealth.deleteRecordsByIds>>
): void {
  expect(result.status).toBe('completed')
  if (result.status !== 'completed') return

  expect(result.requestedCount).toBe(1)
  if (result.deletedCount.status === 'known') {
    expect(result.deletedCount.value).toBe(1)
  }
}

describe('NitroHealth deletes (native)', () => {
  it('rejects empty record identity arrays before crossing the native boundary', async () => {
    await expect(NitroHealth.deleteRecordsByIds('steps', [])).rejects.toThrow(
      'At least one record identity is required'
    )
  })

  it('rejects record-child identities until the caller explicitly selects the parent record', async () => {
    const child: HealthRecordChildIdentity = {
      kind: 'record-child',
      id: 'parent#0',
      record: { kind: 'record', id: 'parent' },
    }

    await expect(
      // @ts-expect-error This test exercises runtime validation for untyped JavaScript callers.
      NitroHealth.deleteRecordsByIds('heartRate', [child])
    ).rejects.toThrow('records[0]: an independently deletable record identity is required')
  })

  it('returns observable count state for a time-range delete that matches nothing', async () => {
    if (!(await hasVerifiedPermissions([{ accessType: 'write', dataType: 'steps' }]))) return

    const result = await NitroHealth.deleteRecordsByTimeRange('steps', emptyRange)

    expect(result.status).toBe('completed')
    if (result.status === 'completed' && result.deletedCount.status === 'known') {
      expect(result.deletedCount.value).toBe(0)
    }
  })

  it('reports a no-match identity deletion according to native count visibility', async () => {
    if (!(await hasVerifiedPermissions([{ accessType: 'write', dataType: 'steps' }]))) return

    const outcome = await NitroHealth.deleteRecordsByIds('steps', [nonexistentRecord]).then(
      (result) => ({ status: 'completed' as const, result }),
      (error: unknown) => ({ status: 'rejected' as const, error })
    )

    if (outcome.status === 'completed') {
      expect(outcome.result.deletedCount).toEqual({ status: 'unverifiable' })
      return
    }

    expect(outcome.error).toBeInstanceOf(Error)
    expect((outcome.error as Error).message).toContain(
      'No caller-owned health records matched the supplied identities'
    )
  })

  it('round-trips save, delete by record identity, and re-read for steps', async () => {
    const authorized = await hasVerifiedPermissions([
      { accessType: 'write', dataType: 'steps' },
      { accessType: 'read', dataType: 'steps' },
    ])
    if (!authorized) return

    await NitroHealth.saveSteps([{ ...deleteInterval, count: 4321 }])
    const page = await NitroHealth.readSteps(deleteReadRange)
    assertConclusiveRead(page.samples)

    const saved = page.samples.find((sample) => sample.count === 4321)
    expect(saved).toBeDefined()
    if (saved === undefined || saved.identity.kind !== 'record') return

    const result = await NitroHealth.deleteRecordsByIds('steps', [saved.identity])
    assertCompletedIdentityDelete(result)

    const afterDelete = await NitroHealth.readSteps(deleteReadRange)
    expect(afterDelete.samples.some((sample) => sample.identity.id === saved.identity.id)).toBe(
      false
    )
  })

  it('round-trips save, delete by time range, and observes count when available', async () => {
    const authorized = await hasVerifiedPermissions([
      { accessType: 'write', dataType: 'steps' },
      { accessType: 'read', dataType: 'steps' },
    ])
    if (!authorized) return

    await NitroHealth.saveSteps([{ ...deleteInterval, count: 4322 }])
    const page = await NitroHealth.readSteps(deleteReadRange)
    assertConclusiveRead(page.samples)
    expect(page.samples.some((sample) => sample.count === 4322)).toBe(true)

    const result = await NitroHealth.deleteRecordsByTimeRange('steps', deleteReadRange)
    expect(result.status).toBe('completed')
    if (result.status === 'completed' && result.deletedCount.status === 'known') {
      expect(result.deletedCount.value).toBeGreaterThanOrEqual(1)
    }

    const afterDelete = await NitroHealth.readSteps(deleteReadRange)
    expect(afterDelete.samples.some((sample) => sample.count === 4322)).toBe(false)
  })

  // The acceptance gate for correlation deletion (plan risk R2): the delete must remove the
  // HKCorrelation AND its member quantity samples on iOS, so the re-read finds nothing.
  it('round-trips save, delete by record identity, and re-read for blood pressure', async () => {
    const authorized = await hasVerifiedPermissions([
      { accessType: 'write', dataType: 'bloodPressure' },
      { accessType: 'read', dataType: 'bloodPressure' },
    ])
    if (!authorized) return

    await NitroHealth.saveBloodPressure([
      { date: deleteInterval.startDate, systolicMmHg: 133, diastolicMmHg: 87 },
    ])
    const page = await NitroHealth.readBloodPressure(deleteReadRange)
    assertConclusiveRead(page.samples)

    const saved = page.samples.find(
      (sample) => sample.systolicMmHg === 133 && sample.diastolicMmHg === 87
    )
    expect(saved).toBeDefined()
    if (saved === undefined || saved.identity.kind !== 'record') return

    const result = await NitroHealth.deleteRecordsByIds('bloodPressure', [saved.identity])
    assertCompletedIdentityDelete(result)

    const afterDelete = await NitroHealth.readBloodPressure(deleteReadRange)
    expect(afterDelete.samples.some((sample) => sample.identity.id === saved.identity.id)).toBe(
      false
    )
  })

  it('round-trips save, delete by record identity, and re-read for nutrition', async () => {
    const authorized = await hasVerifiedPermissions([
      { accessType: 'write', dataType: 'nutrition' },
      { accessType: 'read', dataType: 'nutrition' },
    ])
    if (!authorized) return

    await NitroHealth.saveNutrition([
      { ...deleteInterval, foodName: 'Harness delete meal', proteinGrams: 21 },
    ])
    const page = await NitroHealth.readNutrition(deleteReadRange)
    assertConclusiveRead(page.samples)

    const saved = page.samples.find((sample) => sample.foodName === 'Harness delete meal')
    expect(saved).toBeDefined()
    if (saved === undefined || saved.identity.kind !== 'record') return

    // On iOS this exercises the correlation cascade: the entry and its dietary member
    // samples must all disappear, not just the correlation shell.
    const result = await NitroHealth.deleteRecordsByIds('nutrition', [saved.identity])
    assertCompletedIdentityDelete(result)

    const afterDelete = await NitroHealth.readNutrition(deleteReadRange)
    expect(afterDelete.samples.some((sample) => sample.identity.id === saved.identity.id)).toBe(
      false
    )
  })

  it('round-trips save, delete by record identity, and re-read for blood glucose', async () => {
    const authorized = await hasVerifiedPermissions([
      { accessType: 'write', dataType: 'bloodGlucose' },
      { accessType: 'read', dataType: 'bloodGlucose' },
    ])
    if (!authorized) return

    await NitroHealth.saveBloodGlucose([
      { date: deleteInterval.startDate, millimolesPerLiter: 7.7 },
    ])
    const page = await NitroHealth.readBloodGlucose(deleteReadRange)
    assertConclusiveRead(page.samples)

    const saved = page.samples.find((sample) => Math.abs(sample.millimolesPerLiter - 7.7) < 0.001)
    expect(saved).toBeDefined()
    if (saved === undefined || saved.identity.kind !== 'record') return

    const result = await NitroHealth.deleteRecordsByIds('bloodGlucose', [saved.identity])
    assertCompletedIdentityDelete(result)

    const afterDelete = await NitroHealth.readBloodGlucose(deleteReadRange)
    expect(afterDelete.samples.some((sample) => sample.identity.id === saved.identity.id)).toBe(
      false
    )
  })

  it('round-trips save, delete by record identity, and re-read for body temperature', async () => {
    const authorized = await hasVerifiedPermissions([
      { accessType: 'write', dataType: 'bodyTemperature' },
      { accessType: 'read', dataType: 'bodyTemperature' },
    ])
    if (!authorized) return

    await NitroHealth.saveBodyTemperature([{ date: deleteInterval.startDate, celsius: 38.5 }])
    const page = await NitroHealth.readBodyTemperature(deleteReadRange)
    assertConclusiveRead(page.samples)

    const saved = page.samples.find((sample) => Math.abs(sample.celsius - 38.5) < 0.001)
    expect(saved).toBeDefined()
    if (saved === undefined || saved.identity.kind !== 'record') return

    const result = await NitroHealth.deleteRecordsByIds('bodyTemperature', [saved.identity])
    assertCompletedIdentityDelete(result)

    const afterDelete = await NitroHealth.readBodyTemperature(deleteReadRange)
    expect(afterDelete.samples.some((sample) => sample.identity.id === saved.identity.id)).toBe(
      false
    )
  })

  it('round-trips save, delete by record identity, and re-read for respiratory rate', async () => {
    const authorized = await hasVerifiedPermissions([
      { accessType: 'write', dataType: 'respiratoryRate' },
      { accessType: 'read', dataType: 'respiratoryRate' },
    ])
    if (!authorized) return

    await NitroHealth.saveRespiratoryRate([
      { date: deleteInterval.startDate, breathsPerMinute: 22.5 },
    ])
    const page = await NitroHealth.readRespiratoryRate(deleteReadRange)
    assertConclusiveRead(page.samples)

    const saved = page.samples.find((sample) => Math.abs(sample.breathsPerMinute - 22.5) < 0.001)
    expect(saved).toBeDefined()
    if (saved === undefined || saved.identity.kind !== 'record') return

    const result = await NitroHealth.deleteRecordsByIds('respiratoryRate', [saved.identity])
    assertCompletedIdentityDelete(result)

    const afterDelete = await NitroHealth.readRespiratoryRate(deleteReadRange)
    expect(afterDelete.samples.some((sample) => sample.identity.id === saved.identity.id)).toBe(
      false
    )
  })

  it('round-trips save, delete by record identity, and re-read for VO2 max', async () => {
    const authorized = await hasVerifiedPermissions([
      { accessType: 'write', dataType: 'vo2Max' },
      { accessType: 'read', dataType: 'vo2Max' },
    ])
    if (!authorized) return

    await NitroHealth.saveVo2Max([
      { date: deleteInterval.startDate, millilitersPerKilogramPerMinute: 43.5 },
    ])
    const page = await NitroHealth.readVo2Max(deleteReadRange)
    assertConclusiveRead(page.samples)

    const saved = page.samples.find(
      (sample) => Math.abs(sample.millilitersPerKilogramPerMinute - 43.5) < 0.001
    )
    expect(saved).toBeDefined()
    if (saved === undefined || saved.identity.kind !== 'record') return

    const result = await NitroHealth.deleteRecordsByIds('vo2Max', [saved.identity])
    assertCompletedIdentityDelete(result)

    const afterDelete = await NitroHealth.readVo2Max(deleteReadRange)
    expect(afterDelete.samples.some((sample) => sample.identity.id === saved.identity.id)).toBe(
      false
    )
  })

  it('round-trips save, delete by record identity, and re-read for floors climbed', async () => {
    const authorized = await hasVerifiedPermissions([
      { accessType: 'write', dataType: 'floorsClimbed' },
      { accessType: 'read', dataType: 'floorsClimbed' },
    ])
    if (!authorized) return

    await NitroHealth.deleteRecordsByTimeRange('floorsClimbed', deleteReadRange)
    await NitroHealth.saveFloorsClimbed([
      {
        ...deleteInterval,
        floors: 13.5,
        sync: { id: 'nitro-health-harness-floors-delete', version: 1 },
      },
    ])
    const page = await NitroHealth.readFloorsClimbed(deleteReadRange)
    assertConclusiveRead(page.samples)

    const saved = page.samples.find(
      (sample) =>
        Math.abs(sample.floors - 13.5) < 0.001 &&
        sample.startDate.getTime() === deleteInterval.startDate.getTime() &&
        sample.endDate.getTime() === deleteInterval.endDate.getTime()
    )
    expect(saved).toBeDefined()
    if (saved === undefined || saved.identity.kind !== 'record') return

    const result = await NitroHealth.deleteRecordsByIds('floorsClimbed', [saved.identity])
    assertCompletedIdentityDelete(result)

    const afterDelete = await NitroHealth.readFloorsClimbed(deleteReadRange)
    expect(afterDelete.samples.some((sample) => sample.identity.id === saved.identity.id)).toBe(
      false
    )
  })

  it('round-trips save, delete by record identity, and re-read for hydration', async () => {
    const authorized = await hasVerifiedPermissions([
      { accessType: 'write', dataType: 'hydration' },
      { accessType: 'read', dataType: 'hydration' },
    ])
    if (!authorized) return

    await NitroHealth.deleteRecordsByTimeRange('hydration', deleteReadRange)
    try {
      await NitroHealth.saveHydration([
        {
          ...deleteInterval,
          milliliters: 525.5,
          sync: { id: 'nitro-health-harness-hydration-delete', version: 1 },
        },
      ])
      const page = await NitroHealth.readHydration(deleteReadRange)
      assertConclusiveRead(page.samples)

      const saved = page.samples.find((sample) => Math.abs(sample.milliliters - 525.5) < 0.001)
      expect(saved).toBeDefined()
      if (saved === undefined || saved.identity.kind !== 'record') return

      const result = await NitroHealth.deleteRecordsByIds('hydration', [saved.identity])
      assertCompletedIdentityDelete(result)

      const afterDelete = await NitroHealth.readHydration(deleteReadRange)
      expect(afterDelete.samples.some((sample) => sample.identity.id === saved.identity.id)).toBe(
        false
      )
    } finally {
      await NitroHealth.deleteRecordsByTimeRange('hydration', deleteReadRange)
    }
  })

  it('round-trips save, delete by record identity, and re-read for body fat', async () => {
    const authorized = await hasVerifiedPermissions([
      { accessType: 'write', dataType: 'bodyFat' },
      { accessType: 'read', dataType: 'bodyFat' },
    ])
    if (!authorized) return

    await NitroHealth.saveBodyFat([{ date: deleteInterval.startDate, percentage: 27.5 }])
    const page = await NitroHealth.readBodyFat(deleteReadRange)
    assertConclusiveRead(page.samples)

    const saved = page.samples.find((sample) => Math.abs(sample.percentage - 27.5) < 0.001)
    expect(saved).toBeDefined()
    if (saved === undefined || saved.identity.kind !== 'record') return

    const result = await NitroHealth.deleteRecordsByIds('bodyFat', [saved.identity])
    assertCompletedIdentityDelete(result)

    const afterDelete = await NitroHealth.readBodyFat(deleteReadRange)
    expect(afterDelete.samples.some((sample) => sample.identity.id === saved.identity.id)).toBe(
      false
    )
  })

  it('round-trips save, delete by record identity, and re-read for lean body mass', async () => {
    const authorized = await hasVerifiedPermissions([
      { accessType: 'write', dataType: 'leanBodyMass' },
      { accessType: 'read', dataType: 'leanBodyMass' },
    ])
    if (!authorized) return

    await NitroHealth.saveLeanBodyMass([{ date: deleteInterval.startDate, kilograms: 48.5 }])
    const page = await NitroHealth.readLeanBodyMass(deleteReadRange)
    assertConclusiveRead(page.samples)

    const saved = page.samples.find((sample) => Math.abs(sample.kilograms - 48.5) < 0.001)
    expect(saved).toBeDefined()
    if (saved === undefined || saved.identity.kind !== 'record') return

    const result = await NitroHealth.deleteRecordsByIds('leanBodyMass', [saved.identity])
    assertCompletedIdentityDelete(result)

    const afterDelete = await NitroHealth.readLeanBodyMass(deleteReadRange)
    expect(afterDelete.samples.some((sample) => sample.identity.id === saved.identity.id)).toBe(
      false
    )
  })

  it('round-trips save, delete by record identity, and re-read for basal body temperature', async () => {
    const authorized = await hasVerifiedPermissions([
      { accessType: 'write', dataType: 'basalBodyTemperature' },
      { accessType: 'read', dataType: 'basalBodyTemperature' },
    ])
    if (!authorized) return

    await NitroHealth.saveBasalBodyTemperature([{ date: deleteInterval.startDate, celsius: 35.9 }])
    const page = await NitroHealth.readBasalBodyTemperature(deleteReadRange)
    assertConclusiveRead(page.samples)

    const saved = page.samples.find((sample) => Math.abs(sample.celsius - 35.9) < 0.001)
    expect(saved).toBeDefined()
    if (saved === undefined || saved.identity.kind !== 'record') return

    const result = await NitroHealth.deleteRecordsByIds('basalBodyTemperature', [saved.identity])
    assertCompletedIdentityDelete(result)

    const afterDelete = await NitroHealth.readBasalBodyTemperature(deleteReadRange)
    expect(afterDelete.samples.some((sample) => sample.identity.id === saved.identity.id)).toBe(
      false
    )
  })

  it('deletes a heart-rate record and explicitly selects a parent for record children', async () => {
    const authorized = await hasVerifiedPermissions([
      { accessType: 'write', dataType: 'heartRate' },
      { accessType: 'read', dataType: 'heartRate' },
    ])
    if (!authorized) return

    const siblingDate = new Date(deleteInterval.startDate.getTime() + 5 * 60 * 1000)
    await NitroHealth.saveHeartRate([
      { date: deleteInterval.startDate, bpm: 124 },
      { date: siblingDate, bpm: 125 },
    ])

    const page = await NitroHealth.readHeartRate(deleteReadRange)
    assertConclusiveRead(page.samples)
    const target = page.samples.find((sample) => sample.bpm === 124)
    expect(target).toBeDefined()
    if (target === undefined) return

    let record: HealthRecordIdentity
    if (target.identity.kind === 'record-child') {
      await expect(
        // @ts-expect-error This test exercises runtime validation for untyped JavaScript callers.
        NitroHealth.deleteRecordsByIds('heartRate', [target.identity])
      ).rejects.toThrow('an independently deletable record identity is required')
      record = target.identity.record
    } else {
      record = target.identity
    }

    const result = await NitroHealth.deleteRecordsByIds('heartRate', [record])
    assertCompletedIdentityDelete(result)

    const afterDelete = await NitroHealth.readHeartRate(deleteReadRange)
    expect(afterDelete.samples.some((sample) => sample.identity.id === target.identity.id)).toBe(
      false
    )
    expect(afterDelete.samples.some((sample) => sample.bpm === 125)).toBe(true)
  })
})
