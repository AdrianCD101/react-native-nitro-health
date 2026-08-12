import { Platform } from 'react-native'
import { describe, expect, it } from 'react-native-harness'
import { NitroHealth } from 'react-native-nitro-health'
import type { HealthAdditionalAccessStatus } from 'react-native-nitro-health'

const additionalAccessStatuses: HealthAdditionalAccessStatus[] = [
  'included',
  'unsupported',
  'not-declared',
  'not-granted',
  'granted',
]
describe('NitroHealth background access (native)', () => {
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
})
