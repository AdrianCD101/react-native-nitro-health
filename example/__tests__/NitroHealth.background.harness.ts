import { Platform } from 'react-native'
import { describe, expect, it, waitUntil } from 'react-native-harness'
import { NitroHealth } from 'react-native-nitro-health'
import type {
  BackgroundReadAuthorizationStatus,
  HealthRecordChange,
} from 'react-native-nitro-health'

import { hasVerifiedPermissions } from './support/harnessSupport'

const backgroundReadStatuses: BackgroundReadAuthorizationStatus[] = [
  'unavailable',
  'notDeclared',
  'notGranted',
  'granted',
]
const notificationInterval = {
  startDate: new Date('2005-06-01T09:00:00.000Z'),
  endDate: new Date('2005-06-01T09:30:00.000Z'),
}
const notificationRange = {
  startDate: new Date('2005-06-01T00:00:00.000Z'),
  endDate: new Date('2005-06-02T00:00:00.000Z'),
}

async function drainStepChanges(changesToken: string): Promise<HealthRecordChange<'steps'>[]> {
  const changes: HealthRecordChange<'steps'>[] = []
  let currentToken = changesToken

  for (let pageIndex = 0; pageIndex < 20; pageIndex += 1) {
    const result = await NitroHealth.getChanges('steps', currentToken)
    if (result.tokenExpired) throw new Error('Fresh changes token expired unexpectedly')

    changes.push(...result.changes)
    currentToken = result.nextChangesToken
    if (!result.hasMore) return changes
  }

  throw new Error('Step changes did not drain within 20 pages')
}

describe('NitroHealth background access (native)', () => {
  it('reports a platform-appropriate background-read authorization status', async () => {
    const status = await NitroHealth.getBackgroundReadAuthorizationStatus()

    expect(backgroundReadStatuses).toContain(status)
    if (Platform.OS === 'ios') {
      expect(status).toBe('unavailable')
    }
  })

  it('returns without a prompt when background read access is not requestable', async () => {
    const currentStatus = await NitroHealth.getBackgroundReadAuthorizationStatus()
    if (currentStatus === 'notGranted') return

    await expect(NitroHealth.requestBackgroundReadAuthorization()).resolves.toBe(currentStatus)
  })

  it('emits an iOS notification that leads to a durable step change', async () => {
    if (Platform.OS !== 'ios') return

    const authorized = await hasVerifiedPermissions([
      { accessType: 'read', dataType: 'steps' },
      { accessType: 'write', dataType: 'steps' },
    ])
    if (!authorized) return

    await NitroHealth.deleteSamplesByTimeRange('steps', notificationRange)
    await NitroHealth.disableBackgroundDelivery('steps')
    let stepNotificationCount = 0
    const subscription = NitroHealth.addOnChangeNotificationListener(({ dataTypes }) => {
      if (dataTypes.includes('steps')) stepNotificationCount += 1
    })
    let isDeliveryEnabled = false

    try {
      await NitroHealth.enableBackgroundDelivery('steps', 'immediate')
      isDeliveryEnabled = true
      const changesToken = await NitroHealth.createChangesToken('steps')
      const notificationsBeforeSave = stepNotificationCount
      await NitroHealth.saveSteps([
        {
          ...notificationInterval,
          count: 810_001,
          sync: { id: 'nitro-health-harness-background-notification', version: 1 },
        },
      ])

      await waitUntil(() => stepNotificationCount > notificationsBeforeSave, { timeout: 10_000 })

      const changes = await drainStepChanges(changesToken)
      expect(
        changes.some(
          (change) =>
            change.type === 'upsert' && change.samples.some((sample) => sample.count === 810_001)
        )
      ).toBe(true)
    } finally {
      subscription.remove()
      if (isDeliveryEnabled) await NitroHealth.disableBackgroundDelivery('steps')
      await NitroHealth.deleteSamplesByTimeRange('steps', notificationRange)
    }
  })
})
