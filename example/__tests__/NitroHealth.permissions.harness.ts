import { describe, expect, it } from 'react-native-harness'
import { Platform } from 'react-native'
import { NitroHealth } from 'react-native-nitro-health'

import {
  activeEnergyReadPermission,
  bodyMassReadPermission,
  distanceReadPermission,
  heartRateReadPermission,
  sleepReadPermission,
  stepsReadPermission,
} from './support/harnessSupport'

const availabilityStatuses = ['available', 'unavailable', 'providerUpdateRequired']
const authorizationRequestStatuses = ['unknown', 'shouldRequest', 'unnecessary']
const authorizationResultStatuses = ['granted', 'partial', 'denied', 'completed', 'unavailable']

describe('NitroHealth permissions (native)', () => {
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
    const status = await NitroHealth.getRequestStatusForAuthorization(stepsReadPermission)

    expect(authorizationRequestStatuses).toContain(status)
  })

  it('gets request status for Heart Rate read permission from native code', async () => {
    const status = await NitroHealth.getRequestStatusForAuthorization(heartRateReadPermission)

    expect(authorizationRequestStatuses).toContain(status)
  })

  it('gets request status for distance read permission from native code', async () => {
    const status = await NitroHealth.getRequestStatusForAuthorization(distanceReadPermission)

    expect(authorizationRequestStatuses).toContain(status)
  })

  it('gets request status for active energy read permission from native code', async () => {
    const status = await NitroHealth.getRequestStatusForAuthorization(activeEnergyReadPermission)

    expect(authorizationRequestStatuses).toContain(status)
  })

  it('gets request status for sleep read permission from native code', async () => {
    const status = await NitroHealth.getRequestStatusForAuthorization(sleepReadPermission)

    expect(authorizationRequestStatuses).toContain(status)
  })

  it('gets request status for body mass read permission from native code', async () => {
    const status = await NitroHealth.getRequestStatusForAuthorization(bodyMassReadPermission)

    expect(authorizationRequestStatuses).toContain(status)
  })

  it('rejects an empty request status check before crossing the native boundary', async () => {
    await expect(NitroHealth.getRequestStatusForAuthorization([])).rejects.toThrow(
      'At least one health permission is required'
    )
  })

  it('rejects an empty authorization request before crossing the native boundary', async () => {
    await expect(NitroHealth.requestAuthorization([])).rejects.toThrow(
      'At least one health permission is required'
    )
  })

  it('returns a resolved result for already-authorized steps permissions without opening a prompt', async () => {
    const status = await NitroHealth.getRequestStatusForAuthorization(stepsReadPermission)

    if (status !== 'unnecessary') {
      return
    }

    const result = await NitroHealth.requestAuthorization(stepsReadPermission)

    expect(authorizationResultStatuses).toContain(result.status)
    expect(['granted', 'completed']).toContain(result.status)
  })

  it('returns a resolved result for already-authorized Heart Rate permissions without opening a prompt', async () => {
    const status = await NitroHealth.getRequestStatusForAuthorization(heartRateReadPermission)

    if (status !== 'unnecessary') {
      return
    }

    const result = await NitroHealth.requestAuthorization(heartRateReadPermission)

    expect(authorizationResultStatuses).toContain(result.status)
    expect(['granted', 'completed']).toContain(result.status)
  })
})
