import { describe, expect, it } from 'react-native-harness'
import { Platform } from 'react-native'
import { NitroHealth } from 'react-native-nitro-health'
import type { HealthPermission } from 'react-native-nitro-health'

const availabilityStatuses = [
  'available',
  'unavailable',
  'providerUpdateRequired',
]
const authorizationRequestStatuses = [
  'unknown',
  'shouldRequest',
  'unnecessary',
]
const authorizationResultStatuses = [
  'granted',
  'partial',
  'denied',
  'completed',
  'unavailable',
]
const stepsReadPermission: HealthPermission[] = [
  { accessType: 'read', dataType: 'steps' },
]
const heartRateReadPermission: HealthPermission[] = [
  { accessType: 'read', dataType: 'heartRate' },
]

describe('NitroHealth native module', () => {
  it('returns a platform availability status from native code', () => {
    const status = NitroHealth.getAvailabilityStatus()

    expect(availabilityStatuses).toContain(status)
    expect(NitroHealth.isAvailable()).toBe(status === 'available')
  })

  it('only reports providerUpdateRequired as an Android status', () => {
    const status = NitroHealth.getAvailabilityStatus()

    if (Platform.OS === 'ios') {
      expect(status).not.toBe('providerUpdateRequired')
    }
  })

  it('does not open the Android install flow when it is not required', () => {
    const status = NitroHealth.getAvailabilityStatus()

    if (status !== 'providerUpdateRequired') {
      expect(NitroHealth.openHealthConnectInstall()).toBe(false)
    }
  })

  it('gets request status for steps read permission from native code', async () => {
    const status = await NitroHealth.getRequestStatusForAuthorization(
      stepsReadPermission,
    )

    expect(authorizationRequestStatuses).toContain(status)
  })

  it('gets request status for Heart Rate read permission from native code', async () => {
    const status = await NitroHealth.getRequestStatusForAuthorization(
      heartRateReadPermission,
    )

    expect(authorizationRequestStatuses).toContain(status)
  })

  it('returns a resolved result for already-authorized steps permissions without opening a prompt', async () => {
    const status = await NitroHealth.getRequestStatusForAuthorization(
      stepsReadPermission,
    )

    if (status !== 'unnecessary') {
      return
    }

    const result = await NitroHealth.requestAuthorization(stepsReadPermission)

    expect(authorizationResultStatuses).toContain(result.status)
    expect(['granted', 'completed']).toContain(result.status)
  })

  it('returns a resolved result for already-authorized Heart Rate permissions without opening a prompt', async () => {
    const status = await NitroHealth.getRequestStatusForAuthorization(
      heartRateReadPermission,
    )

    if (status !== 'unnecessary') {
      return
    }

    const result = await NitroHealth.requestAuthorization(heartRateReadPermission)

    expect(authorizationResultStatuses).toContain(result.status)
    expect(['granted', 'completed']).toContain(result.status)
  })
})
