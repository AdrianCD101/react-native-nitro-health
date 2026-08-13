import { Platform } from 'react-native'
import { describe, expect, it } from 'react-native-harness'
import { NitroHealth } from 'react-native-nitro-health'

import {
  basalEnergyReadPermission,
  sleepWritePermission,
  stepsReadPermission,
  totalEnergyReadPermission,
} from './support/harnessSupport'

const permissionStatuses = ['granted', 'notGranted', 'notDetermined', 'unverifiable']

describe('NitroHealth permissions (native)', () => {
  it('returns one exact typed availability variant', () => {
    const availability = NitroHealth.getAvailability()

    if (availability.status === 'available') {
      expect(availability).toEqual({ status: 'available' })
      return
    }

    if (availability.reason === 'provider-install-or-update-required') {
      expect(availability).toEqual({
        status: 'unavailable',
        reason: 'provider-install-or-update-required',
        recovery: { kind: 'install-or-update-provider' },
      })
      return
    }

    expect(['not-supported', 'service-unavailable']).toContain(availability.reason)
    expect(availability).toEqual({ status: 'unavailable', reason: availability.reason })
  })

  it('only exposes provider installation recovery on Android', () => {
    const availability = NitroHealth.getAvailability()

    if (Platform.OS === 'ios' && availability.status === 'unavailable') {
      expect(availability.reason).not.toBe('provider-install-or-update-required')
    }
  })

  it('reports read states for aggregate-only energy permissions without prompting', async () => {
    const permissions = [...basalEnergyReadPermission, ...totalEnergyReadPermission]
    const result = await NitroHealth.getPermissionStatuses(permissions)

    expect(result.statuses).toHaveLength(permissions.length)
    expect(result.statuses.map((entry) => entry.permission)).toEqual(permissions)
    expect(result.statuses.every((entry) => permissionStatuses.includes(entry.status))).toBe(true)

    if (result.status === 'available' && Platform.OS === 'ios') {
      // iOS read access is unverifiable by design; the call must still resolve both
      // component quantity types without throwing.
      expect(result.statuses.every((entry) => entry.status === 'unverifiable')).toBe(true)
    }
  })

  it('queries ordered per-entry permission states without requesting authorization', async () => {
    const permissions = [...stepsReadPermission, ...sleepWritePermission, ...stepsReadPermission]
    const result = await NitroHealth.getPermissionStatuses(permissions)

    expect(result.statuses).toHaveLength(permissions.length)
    expect(result.statuses.map((entry) => entry.permission)).toEqual(permissions)
    expect(result.statuses.every((entry) => permissionStatuses.includes(entry.status))).toBe(true)

    if (result.status === 'unavailable') {
      expect(result.availability.status).toBe('unavailable')
      expect(result.statuses.every((entry) => entry.status === 'unverifiable')).toBe(true)
      return
    }

    if (Platform.OS === 'ios') {
      expect(result.statuses[0]?.status).toBe('unverifiable')
      expect(['granted', 'notGranted', 'notDetermined', 'unverifiable']).toContain(
        result.statuses[1]?.status
      )
    } else {
      expect(
        result.statuses.every((entry) => ['granted', 'notGranted'].includes(entry.status))
      ).toBe(true)
    }
  })

  it('rejects empty permission operations before crossing the native boundary', async () => {
    await expect(NitroHealth.getPermissionStatuses([])).rejects.toThrow(
      'At least one health permission is required'
    )
    await expect(NitroHealth.requestAuthorization([])).rejects.toThrow(
      'At least one health permission is required'
    )
  })
})
