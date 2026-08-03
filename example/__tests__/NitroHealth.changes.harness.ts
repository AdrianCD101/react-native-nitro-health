import { Platform } from 'react-native'
import { describe, expect, it } from 'react-native-harness'
import { NitroHealth } from 'react-native-nitro-health'
import type { HealthRecordChange } from 'react-native-nitro-health'

import { hasVerifiedPermissions } from './support/harnessSupport'

const changeInterval = {
  startDate: new Date('2003-06-01T09:00:00.000Z'),
  endDate: new Date('2003-06-01T09:30:00.000Z'),
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

describe('NitroHealth changes (native)', () => {
  it('observes a saved and then deleted step record', async () => {
    const authorized = await hasVerifiedPermissions([
      { accessType: 'read', dataType: 'steps' },
      { accessType: 'write', dataType: 'steps' },
    ])

    if (!authorized) {
      return
    }

    const baselineToken = await NitroHealth.createChangesToken('steps')
    await NitroHealth.saveSteps([{ ...changeInterval, count: 987_654 }])

    const afterSave = await drainStepChanges(baselineToken)
    const upsert = afterSave.changes.find(
      (change) =>
        change.type === 'upsert' && change.samples.some((sample) => sample.count === 987_654)
    )

    // HealthKit hides read denials and returns no changes, even when writing is allowed.
    if (Platform.OS === 'ios' && upsert === undefined) {
      return
    }

    expect(upsert).toBeDefined()
    if (upsert === undefined || upsert.type !== 'upsert') {
      return
    }

    expect(upsert.samples.every((sample) => sample.recordUuid === upsert.recordUuid)).toBe(true)

    await NitroHealth.deleteSamplesByUuids('steps', [upsert.samples[0].uuid])

    const afterDelete = await drainStepChanges(afterSave.changesToken)
    expect(
      afterDelete.changes.some(
        (change) => change.type === 'delete' && change.recordUuid === upsert.recordUuid
      )
    ).toBe(true)
  })

  it('rejects a malformed changes token', async () => {
    if (!(await hasVerifiedPermissions([{ accessType: 'read', dataType: 'steps' }]))) {
      return
    }

    await expect(NitroHealth.getChanges('steps', 'not-a-real-token')).rejects.toThrow(
      /invalid changes token/i
    )
  })
})
