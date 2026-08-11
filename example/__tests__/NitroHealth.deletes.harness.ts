import { describe, expect, it } from 'react-native-harness'
import { NitroHealth } from 'react-native-nitro-health'
import type { HealthRecordChildIdentity, HealthRecordIdentity } from 'react-native-nitro-health'

import {
  deleteInterval,
  deleteReadRange,
  emptyRange,
  hasVerifiedPermissions,
  isInconclusiveRead,
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
      NitroHealth.deleteRecordsByIds('heartRate', [child as unknown as HealthRecordIdentity])
    ).rejects.toThrow('records[0]: an independently deletable record identity is required')
  })

  it('rejects deleting records when write permission is reported not granted', async () => {
    const permissionResult = await NitroHealth.getPermissionStatuses([
      { accessType: 'write', dataType: 'steps' },
    ])
    if (
      permissionResult.status === 'unavailable' ||
      permissionResult.statuses[0]?.status !== 'notGranted'
    ) {
      return
    }

    await expect(NitroHealth.deleteRecordsByIds('steps', [nonexistentRecord])).rejects.toThrow(
      /permission/i
    )
    await expect(NitroHealth.deleteRecordsByTimeRange('steps', deleteReadRange)).rejects.toThrow(
      /permission/i
    )
  })

  it('returns observable count state for a time-range delete that matches nothing', async () => {
    if (!(await hasVerifiedPermissions([{ accessType: 'write', dataType: 'steps' }]))) return

    const result = await NitroHealth.deleteRecordsByTimeRange('steps', emptyRange)

    expect(result.status).toBe('completed')
    if (result.status === 'completed' && result.deletedCount.status === 'known') {
      expect(result.deletedCount.value).toBe(0)
    }
  })

  it('rejects identity deletion when no caller-owned record matches', async () => {
    if (!(await hasVerifiedPermissions([{ accessType: 'write', dataType: 'steps' }]))) return

    await expect(NitroHealth.deleteRecordsByIds('steps', [nonexistentRecord])).rejects.toThrow()
  })

  it('round-trips save, delete by record identity, and re-read for steps', async () => {
    const authorized = await hasVerifiedPermissions([
      { accessType: 'write', dataType: 'steps' },
      { accessType: 'read', dataType: 'steps' },
    ])
    if (!authorized) return

    await NitroHealth.saveSteps([{ ...deleteInterval, count: 4321 }])
    const page = await NitroHealth.readSteps(deleteReadRange)
    if (isInconclusiveRead(page.samples)) return

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
    if (isInconclusiveRead(page.samples)) return
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
    if (isInconclusiveRead(page.samples)) return

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
    if (isInconclusiveRead(page.samples)) return

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
    if (isInconclusiveRead(page.samples)) return

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
    if (isInconclusiveRead(page.samples)) return

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
    if (isInconclusiveRead(page.samples)) return
    const target = page.samples.find((sample) => sample.bpm === 124)
    expect(target).toBeDefined()
    if (target === undefined) return

    let record: HealthRecordIdentity
    if (target.identity.kind === 'record-child') {
      await expect(
        NitroHealth.deleteRecordsByIds('heartRate', [
          target.identity as unknown as HealthRecordIdentity,
        ])
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
