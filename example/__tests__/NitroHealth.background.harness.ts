import { Platform } from 'react-native'
import { describe, expect, it, waitUntil } from 'react-native-harness'
import { NitroHealth } from 'react-native-nitro-health'
import type { HealthAdditionalAccessStatus, HealthRecordChange } from 'react-native-nitro-health'

import { hasVerifiedPermissions } from './support/harnessSupport'

const additionalAccessStatuses: HealthAdditionalAccessStatus[] = [
  'included',
  'unsupported',
  'not-declared',
  'not-granted',
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
  const observerIt = Platform.OS === 'ios' ? it : it.skip

  it('reports an exact observer or app-owned polling capability', async () => {
    const capabilities = await NitroHealth.getCapabilities()
    if (capabilities.status === 'unavailable') {
      expect(NitroHealth.getAvailability().status).toBe('unavailable')
      return
    }
    const background = capabilities.backgroundChanges

    expect(additionalAccessStatuses).toContain(capabilities.historyRead)
    if (background.mode === 'observer') {
      expect(background).toEqual({
        mode: 'observer',
        frequencies: ['immediate', 'hourly', 'daily', 'weekly'],
        backgroundRead: 'included',
      })
    } else {
      expect(background.scheduling).toBe('app-owned')
      expect(additionalAccessStatuses).toContain(background.backgroundRead)
    }

    if (Platform.OS === 'android') {
      expect(background.mode).toBe('polling')
      expect(background.backgroundRead).not.toBe('not-declared')
      expect(capabilities.historyRead).not.toBe('not-declared')
    }
  })

  it('returns the current background-read state without prompting when it is not requestable', async () => {
    const capabilities = await NitroHealth.getCapabilities()
    if (capabilities.status === 'unavailable') return
    const currentStatus = capabilities.backgroundChanges.backgroundRead
    if (currentStatus === 'not-granted') return

    const result = await NitroHealth.requestAdditionalAccess('background-read')

    expect(result).toEqual({ access: 'background-read', status: currentStatus })
  })

  it('returns the current history-read state without prompting when it is not requestable', async () => {
    const capabilities = await NitroHealth.getCapabilities()
    if (capabilities.status === 'unavailable') return
    if (capabilities.historyRead === 'not-granted') return

    const result = await NitroHealth.requestAdditionalAccess('history-read')

    expect(result).toEqual({ access: 'history-read', status: capabilities.historyRead })
  })

  it('configures and subscribes according to the reported background mode', async () => {
    const capabilities = await NitroHealth.getCapabilities()
    if (capabilities.status === 'unavailable') {
      expect(NitroHealth.subscribeToBackgroundChanges(() => {}).mode).toBe('unavailable')
      return
    }
    const result = await NitroHealth.configureBackgroundChanges({
      dataTypes: ['steps'],
      frequency: 'immediate',
    })

    if (NitroHealth.getAvailability().status === 'unavailable') {
      expect(result.status).toBe('unavailable')
      return
    }

    const subscription = NitroHealth.subscribeToBackgroundChanges(() => {})
    if (capabilities.backgroundChanges.mode === 'observer') {
      expect(result).toEqual({ status: 'completed', mode: 'observer' })
      expect(subscription.mode).toBe('observer')
      if (subscription.mode === 'observer') subscription.subscription.remove()
    } else {
      expect(result).toEqual({
        status: 'user-action-required',
        mode: 'polling',
        scheduling: 'app-owned',
        backgroundRead: capabilities.backgroundChanges.backgroundRead,
      })
      expect(subscription).toEqual({ mode: 'polling', scheduling: 'app-owned' })
    }

    const disabled = await NitroHealth.disableBackgroundChanges(['steps'])
    expect(disabled.status).not.toBe('unavailable')
    if (disabled.status !== 'unavailable') {
      expect(disabled.mode).toBe(capabilities.backgroundChanges.mode)
    }
  })

  observerIt('emits an observer notification that leads to a durable step change', async () => {
    const capabilities = await NitroHealth.getCapabilities()
    if (capabilities.status === 'unavailable') {
      throw new Error('Harness prerequisite failed: health data is unavailable')
    }
    if (capabilities.backgroundChanges.mode !== 'observer') {
      throw new Error('Harness prerequisite failed: observer background changes are unavailable')
    }

    const authorized = await hasVerifiedPermissions([
      { accessType: 'read', dataType: 'steps' },
      { accessType: 'write', dataType: 'steps' },
    ])
    if (!authorized) return

    await NitroHealth.deleteRecordsByTimeRange('steps', notificationRange)
    await NitroHealth.disableBackgroundChanges(['steps'])
    let stepNotificationCount = 0
    const subscriptionResult = NitroHealth.subscribeToBackgroundChanges(({ dataTypes }) => {
      if (dataTypes.includes('steps')) stepNotificationCount += 1
    })
    if (subscriptionResult.mode !== 'observer') {
      throw new Error('Observer capability returned a polling subscription')
    }
    let isDeliveryEnabled = false

    try {
      const configured = await NitroHealth.configureBackgroundChanges({
        dataTypes: ['steps'],
        frequency: 'immediate',
      })
      expect(configured).toEqual({ status: 'completed', mode: 'observer' })
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
      subscriptionResult.subscription.remove()
      if (isDeliveryEnabled) await NitroHealth.disableBackgroundChanges(['steps'])
      await NitroHealth.deleteRecordsByTimeRange('steps', notificationRange)
    }
  })
})
