import { Platform } from 'react-native'
import { describe, expect, it } from 'react-native-harness'
import { NitroHealth } from 'react-native-nitro-health'
import type { HealthRecordChange } from 'react-native-nitro-health'

import { requireVerifiedPermissions } from './support/harnessSupport'

const changeInterval = {
  startDate: new Date('2003-06-01T09:00:00.000Z'),
  endDate: new Date('2003-06-01T09:30:00.000Z'),
}
const replacementChangeInterval = {
  startDate: new Date('2003-06-02T09:00:00.000Z'),
  endDate: new Date('2003-06-02T09:30:00.000Z'),
}
const replacementChangeRange = {
  startDate: new Date('2003-06-02T00:00:00.000Z'),
  endDate: new Date('2003-06-03T00:00:00.000Z'),
}

async function drainStepChanges(changesToken: string): Promise<{
  changes: HealthRecordChange<'steps'>[]
  changesToken: string
}> {
  const changes: HealthRecordChange<'steps'>[] = []
  let currentToken = changesToken

  for (let pageIndex = 0; pageIndex < 20; pageIndex += 1) {
    const result = await NitroHealth.getChanges('steps', currentToken)

    if (result.tokenExpired) {
      throw new Error('Fresh changes token expired unexpectedly')
    }

    changes.push(...result.changes)
    currentToken = result.nextChangesToken

    if (!result.hasMore) {
      return { changes, changesToken: currentToken }
    }
  }

  throw new Error('Step changes did not drain within 20 pages')
}

async function drainFloorsClimbedChanges(changesToken: string): Promise<{
  changes: HealthRecordChange<'floorsClimbed'>[]
  changesToken: string
}> {
  const changes: HealthRecordChange<'floorsClimbed'>[] = []
  let currentToken = changesToken

  for (let pageIndex = 0; pageIndex < 20; pageIndex += 1) {
    const result = await NitroHealth.getChanges('floorsClimbed', currentToken)
    if (result.tokenExpired) throw new Error('Fresh changes token expired unexpectedly')

    changes.push(...result.changes)
    currentToken = result.nextChangesToken
    if (!result.hasMore) return { changes, changesToken: currentToken }
  }

  throw new Error('Floors-climbed changes did not drain within 20 pages')
}

async function drainHydrationChanges(changesToken: string): Promise<{
  changes: HealthRecordChange<'hydration'>[]
  changesToken: string
}> {
  const changes: HealthRecordChange<'hydration'>[] = []
  let currentToken = changesToken

  for (let pageIndex = 0; pageIndex < 20; pageIndex += 1) {
    const result = await NitroHealth.getChanges('hydration', currentToken)
    if (result.tokenExpired) throw new Error('Fresh changes token expired unexpectedly')

    changes.push(...result.changes)
    currentToken = result.nextChangesToken
    if (!result.hasMore) return { changes, changesToken: currentToken }
  }

  throw new Error('Hydration changes did not drain within 20 pages')
}

describe('NitroHealth changes (native)', () => {
  it('observes a saved and then deleted step record', async () => {
    await requireVerifiedPermissions([
      { accessType: 'read', dataType: 'steps' },
      { accessType: 'write', dataType: 'steps' },
    ])

    const baselineToken = await NitroHealth.createChangesToken('steps')
    await NitroHealth.saveSteps([
      {
        ...changeInterval,
        count: 987_654,
        device: { type: 'watch', manufacturer: 'Nitro Health', model: 'Harness Sensor' },
        recordingMethod: 'actively-recorded',
      },
    ])

    const afterSave = await drainStepChanges(baselineToken)
    const upsert = afterSave.changes.find(
      (change) =>
        change.type === 'upsert' && change.samples.some((sample) => sample.count === 987_654)
    )

    // HealthKit hides read denials and returns no changes, even when writing is allowed.
    expect(upsert).toBeDefined()
    if (upsert === undefined || upsert.type !== 'upsert') {
      return
    }

    expect(
      upsert.samples.every((sample) =>
        sample.identity.kind === 'record'
          ? sample.identity.id === upsert.record.id
          : sample.identity.record.id === upsert.record.id
      )
    ).toBe(true)
    if (Platform.OS === 'android') {
      expect(upsert.samples.every((sample) => sample.device?.type === 'watch')).toBe(true)
    } else {
      expect(upsert.samples.every((sample) => sample.device?.type === undefined)).toBe(true)
    }
    expect(upsert.samples.every((sample) => sample.device?.manufacturer === 'Nitro Health')).toBe(
      true
    )
    expect(upsert.samples.every((sample) => sample.device?.model === 'Harness Sensor')).toBe(true)

    const deletion = await NitroHealth.deleteRecordsByIds('steps', [upsert.record])
    expect(deletion.status).toBe('completed')
    if (deletion.status === 'completed') {
      expect(deletion.requestedCount).toBe(1)
      if (deletion.deletedCount.status === 'known') {
        expect(deletion.deletedCount.value).toBe(1)
      }
    }

    const afterDelete = await drainStepChanges(afterSave.changesToken)
    expect(
      afterDelete.changes.some(
        (change) => change.type === 'delete' && change.record.id === upsert.record.id
      )
    ).toBe(true)
  })

  it('reports platform-specific changes when a higher step version replaces a record', async () => {
    await requireVerifiedPermissions([
      { accessType: 'read', dataType: 'steps' },
      { accessType: 'write', dataType: 'steps' },
    ])

    await NitroHealth.deleteRecordsByTimeRange('steps', replacementChangeRange)

    try {
      const baselineToken = await NitroHealth.createChangesToken('steps')
      await NitroHealth.saveSteps([
        {
          ...replacementChangeInterval,
          count: 987_651,
          sync: { id: 'nitro-health-harness-changes-replacement', version: 1 },
        },
      ])

      const afterInitialSave = await drainStepChanges(baselineToken)
      const initialUpsert = afterInitialSave.changes.find(
        (change) =>
          change.type === 'upsert' && change.samples.some((sample) => sample.count === 987_651)
      )

      // HealthKit hides read denials and returns no changes, even when writing is allowed.
      expect(initialUpsert).toBeDefined()
      if (initialUpsert === undefined || initialUpsert.type !== 'upsert') {
        return
      }

      await NitroHealth.saveSteps([
        {
          ...replacementChangeInterval,
          count: 987_652,
          sync: { id: 'nitro-health-harness-changes-replacement', version: 2 },
        },
      ])

      const afterReplacement = await drainStepChanges(afterInitialSave.changesToken)
      const replacementUpserts = afterReplacement.changes.filter(
        (change) =>
          change.type === 'upsert' && change.samples.some((sample) => sample.count === 987_652)
      )

      expect(replacementUpserts).toHaveLength(1)
      const replacementUpsert = replacementUpserts[0]
      if (replacementUpsert === undefined || replacementUpsert.type !== 'upsert') {
        return
      }

      const deletedInitialRecord = afterReplacement.changes.some(
        (change) => change.type === 'delete' && change.record.id === initialUpsert.record.id
      )

      if (Platform.OS === 'android') {
        expect(replacementUpsert.record.id).toBe(initialUpsert.record.id)
        expect(deletedInitialRecord).toBe(false)
      } else if (Platform.OS === 'ios') {
        expect(replacementUpsert.record.id).not.toBe(initialUpsert.record.id)
        expect(deletedInitialRecord).toBe(true)
      }
    } finally {
      await NitroHealth.deleteRecordsByTimeRange('steps', replacementChangeRange)
    }
  })

  it('observes a saved and then deleted floors-climbed record', async () => {
    const permissions = [
      { accessType: 'read' as const, dataType: 'floorsClimbed' as const },
      { accessType: 'write' as const, dataType: 'floorsClimbed' as const },
    ]
    await requireVerifiedPermissions(permissions)

    const range = {
      startDate: new Date('2003-06-03T00:00:00.000Z'),
      endDate: new Date('2003-06-04T00:00:00.000Z'),
    }
    const interval = {
      startDate: new Date('2003-06-03T09:00:00.000Z'),
      endDate: new Date('2003-06-03T09:30:00.000Z'),
    }

    await NitroHealth.deleteRecordsByTimeRange('floorsClimbed', range)
    try {
      const baselineToken = await NitroHealth.createChangesToken('floorsClimbed')
      await NitroHealth.saveFloorsClimbed([
        {
          ...interval,
          floors: 14.5,
          sync: { id: 'nitro-health-harness-floors-changes', version: 1 },
        },
      ])

      const afterSave = await drainFloorsClimbedChanges(baselineToken)
      const upsert = afterSave.changes.find(
        (change) =>
          change.type === 'upsert' &&
          change.samples.some(
            (sample) =>
              Math.abs(sample.floors - 14.5) < 0.001 &&
              sample.startDate.getTime() === interval.startDate.getTime() &&
              sample.endDate.getTime() === interval.endDate.getTime()
          )
      )
      expect(upsert).toBeDefined()
      if (upsert === undefined || upsert.type !== 'upsert') return

      await NitroHealth.deleteRecordsByIds('floorsClimbed', [upsert.record])
      const afterDelete = await drainFloorsClimbedChanges(afterSave.changesToken)
      expect(
        afterDelete.changes.some(
          (change) => change.type === 'delete' && change.record.id === upsert.record.id
        )
      ).toBe(true)
    } finally {
      await NitroHealth.deleteRecordsByTimeRange('floorsClimbed', range)
    }
  })

  it('observes a saved and then deleted hydration record', async () => {
    const permissions = [
      { accessType: 'read' as const, dataType: 'hydration' as const },
      { accessType: 'write' as const, dataType: 'hydration' as const },
    ]
    await requireVerifiedPermissions(permissions)

    const range = {
      startDate: new Date('2003-06-04T00:00:00.000Z'),
      endDate: new Date('2003-06-05T00:00:00.000Z'),
    }
    const interval = {
      startDate: new Date('2003-06-04T09:00:00.000Z'),
      endDate: new Date('2003-06-04T09:30:00.000Z'),
    }

    await NitroHealth.deleteRecordsByTimeRange('hydration', range)
    try {
      const baselineToken = await NitroHealth.createChangesToken('hydration')
      await NitroHealth.saveHydration([
        {
          ...interval,
          milliliters: 425.5,
          sync: { id: 'nitro-health-harness-hydration-changes', version: 1 },
        },
      ])

      const afterSave = await drainHydrationChanges(baselineToken)
      const upsert = afterSave.changes.find(
        (change) =>
          change.type === 'upsert' &&
          change.samples.some((sample) => Math.abs(sample.milliliters - 425.5) < 0.001)
      )
      expect(upsert).toBeDefined()
      if (upsert === undefined || upsert.type !== 'upsert') return

      await NitroHealth.deleteRecordsByIds('hydration', [upsert.record])
      const afterDelete = await drainHydrationChanges(afterSave.changesToken)
      expect(
        afterDelete.changes.some(
          (change) => change.type === 'delete' && change.record.id === upsert.record.id
        )
      ).toBe(true)
    } finally {
      await NitroHealth.deleteRecordsByTimeRange('hydration', range)
    }
  })

  it('rejects a malformed changes token', async () => {
    await requireVerifiedPermissions([{ accessType: 'read', dataType: 'steps' }])

    await expect(NitroHealth.getChanges('steps', 'not-a-real-token')).rejects.toThrow(
      /invalid changes token/i
    )
  })
})
