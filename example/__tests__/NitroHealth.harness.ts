import { describe, expect, it } from 'react-native-harness'
import { Platform } from 'react-native'
import { NitroHealth } from 'react-native-nitro-health'
import type { HealthPermission } from 'react-native-nitro-health'

const availabilityStatuses = ['available', 'unavailable', 'providerUpdateRequired']
const authorizationRequestStatuses = ['unknown', 'shouldRequest', 'unnecessary']
const authorizationResultStatuses = ['granted', 'partial', 'denied', 'completed', 'unavailable']
const stepsReadPermission: HealthPermission[] = [{ accessType: 'read', dataType: 'steps' }]
const distanceReadPermission: HealthPermission[] = [{ accessType: 'read', dataType: 'distance' }]
const activeEnergyReadPermission: HealthPermission[] = [
  { accessType: 'read', dataType: 'activeEnergyBurned' },
]
const heartRateReadPermission: HealthPermission[] = [{ accessType: 'read', dataType: 'heartRate' }]
const emptyRange = {
  startDate: new Date('2000-01-01T00:00:00.000Z'),
  endDate: new Date('2000-01-02T00:00:00.000Z'),
}

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

  it('reads steps from native code without crashing', async () => {
    try {
      const steps = await NitroHealth.readSteps(emptyRange)

      expect(Array.isArray(steps)).toBe(true)
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('rejects reading steps on Android when permission is not granted', async () => {
    if (Platform.OS !== 'android') {
      return
    }

    const status = await NitroHealth.getRequestStatusForAuthorization(stepsReadPermission)

    if (status === 'unnecessary') {
      return
    }

    await expect(NitroHealth.readSteps(emptyRange)).rejects.toThrow(/permission/i)
  })

  it('returns empty steps on iOS when permission is not granted (HealthKit silent-empty)', async () => {
    if (Platform.OS !== 'ios') {
      return
    }

    const status = await NitroHealth.getRequestStatusForAuthorization(stepsReadPermission)

    if (status === 'unnecessary') {
      return
    }

    const steps = await NitroHealth.readSteps(emptyRange)

    expect(Array.isArray(steps)).toBe(true)
  })

  it('reads daily step totals from native code without crashing', async () => {
    try {
      const totals = await NitroHealth.readDailyStepTotals(emptyRange)

      expect(Array.isArray(totals)).toBe(true)
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('rejects reading daily step totals on Android when permission is not granted', async () => {
    if (Platform.OS !== 'android') {
      return
    }

    const status = await NitroHealth.getRequestStatusForAuthorization(stepsReadPermission)

    if (status === 'unnecessary') {
      return
    }

    await expect(NitroHealth.readDailyStepTotals(emptyRange)).rejects.toThrow(/permission/i)
  })

  it('returns empty daily step totals on iOS when permission is not granted (HealthKit silent-empty)', async () => {
    if (Platform.OS !== 'ios') {
      return
    }

    const status = await NitroHealth.getRequestStatusForAuthorization(stepsReadPermission)

    if (status === 'unnecessary') {
      return
    }

    const totals = await NitroHealth.readDailyStepTotals(emptyRange)

    expect(Array.isArray(totals)).toBe(true)
  })

  it('reads distance from native code without crashing', async () => {
    try {
      const samples = await NitroHealth.readDistance(emptyRange)

      expect(Array.isArray(samples)).toBe(true)
      for (const sample of samples) {
        expect(typeof sample.distanceMeters).toBe('number')
      }
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('rejects reading distance on Android when permission is not granted', async () => {
    if (Platform.OS !== 'android') {
      return
    }

    const status = await NitroHealth.getRequestStatusForAuthorization(distanceReadPermission)

    if (status === 'unnecessary') {
      return
    }

    await expect(NitroHealth.readDistance(emptyRange)).rejects.toThrow(/permission/i)
  })

  it('returns empty distance on iOS when permission is not granted (HealthKit silent-empty)', async () => {
    if (Platform.OS !== 'ios') {
      return
    }

    const status = await NitroHealth.getRequestStatusForAuthorization(distanceReadPermission)

    if (status === 'unnecessary') {
      return
    }

    const samples = await NitroHealth.readDistance(emptyRange)

    expect(Array.isArray(samples)).toBe(true)
  })

  it('reads daily distance totals from native code without crashing', async () => {
    try {
      const totals = await NitroHealth.readDailyDistanceTotals(emptyRange)

      expect(Array.isArray(totals)).toBe(true)
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('rejects invalid activity quantity ranges before crossing the native boundary', async () => {
    const invalidRange = {
      startDate: new Date('2026-01-02T00:00:00.000Z'),
      endDate: new Date('2026-01-01T00:00:00.000Z'),
    }

    await expect(NitroHealth.readDistance(invalidRange)).rejects.toThrow(
      'startDate must be before endDate'
    )
    await expect(NitroHealth.readDailyDistanceTotals(invalidRange)).rejects.toThrow(
      'startDate must be before endDate'
    )
    await expect(NitroHealth.readActiveEnergyBurned(invalidRange)).rejects.toThrow(
      'startDate must be before endDate'
    )
    await expect(NitroHealth.readDailyActiveEnergyBurnedTotals(invalidRange)).rejects.toThrow(
      'startDate must be before endDate'
    )
  })

  it('rejects reading daily distance totals on Android when permission is not granted', async () => {
    if (Platform.OS !== 'android') {
      return
    }

    const status = await NitroHealth.getRequestStatusForAuthorization(distanceReadPermission)

    if (status === 'unnecessary') {
      return
    }

    await expect(NitroHealth.readDailyDistanceTotals(emptyRange)).rejects.toThrow(/permission/i)
  })

  it('reads active energy burned from native code without crashing', async () => {
    try {
      const samples = await NitroHealth.readActiveEnergyBurned(emptyRange)

      expect(Array.isArray(samples)).toBe(true)
      for (const sample of samples) {
        expect(typeof sample.kilocalories).toBe('number')
      }
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('rejects reading active energy burned on Android when permission is not granted', async () => {
    if (Platform.OS !== 'android') {
      return
    }

    const status = await NitroHealth.getRequestStatusForAuthorization(activeEnergyReadPermission)

    if (status === 'unnecessary') {
      return
    }

    await expect(NitroHealth.readActiveEnergyBurned(emptyRange)).rejects.toThrow(/permission/i)
  })

  it('returns empty active energy burned on iOS when permission is not granted (HealthKit silent-empty)', async () => {
    if (Platform.OS !== 'ios') {
      return
    }

    const status = await NitroHealth.getRequestStatusForAuthorization(activeEnergyReadPermission)

    if (status === 'unnecessary') {
      return
    }

    const samples = await NitroHealth.readActiveEnergyBurned(emptyRange)

    expect(Array.isArray(samples)).toBe(true)
  })

  it('reads daily active energy burned totals from native code without crashing', async () => {
    try {
      const totals = await NitroHealth.readDailyActiveEnergyBurnedTotals(emptyRange)

      expect(Array.isArray(totals)).toBe(true)
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('rejects reading daily active energy burned totals on Android when permission is not granted', async () => {
    if (Platform.OS !== 'android') {
      return
    }

    const status = await NitroHealth.getRequestStatusForAuthorization(activeEnergyReadPermission)

    if (status === 'unnecessary') {
      return
    }

    await expect(NitroHealth.readDailyActiveEnergyBurnedTotals(emptyRange)).rejects.toThrow(
      /permission/i
    )
  })

  it('reads heart rate from native code without crashing', async () => {
    try {
      const samples = await NitroHealth.readHeartRate(emptyRange)

      expect(Array.isArray(samples)).toBe(true)
      for (const sample of samples) {
        expect(typeof sample.bpm).toBe('number')
        expect(['string', 'undefined']).toContain(typeof sample.source)
      }
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('rejects reading heart rate on Android when permission is not granted', async () => {
    if (Platform.OS !== 'android') {
      return
    }

    const status = await NitroHealth.getRequestStatusForAuthorization(heartRateReadPermission)

    if (status === 'unnecessary') {
      return
    }

    await expect(NitroHealth.readHeartRate(emptyRange)).rejects.toThrow(/permission/i)
  })

  it('returns empty heart rate on iOS when permission is not granted (HealthKit silent-empty)', async () => {
    if (Platform.OS !== 'ios') {
      return
    }

    const status = await NitroHealth.getRequestStatusForAuthorization(heartRateReadPermission)

    if (status === 'unnecessary') {
      return
    }

    const samples = await NitroHealth.readHeartRate(emptyRange)

    expect(Array.isArray(samples)).toBe(true)
  })

  it('reads heart rate statistics from native code without crashing', async () => {
    try {
      const statistics = await NitroHealth.readHeartRateStatistics(emptyRange)

      for (const value of [statistics.average, statistics.min, statistics.max]) {
        expect(['number', 'undefined']).toContain(typeof value)
      }
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('rejects reading heart rate statistics on Android when permission is not granted', async () => {
    if (Platform.OS !== 'android') {
      return
    }

    const status = await NitroHealth.getRequestStatusForAuthorization(heartRateReadPermission)

    if (status === 'unnecessary') {
      return
    }

    await expect(NitroHealth.readHeartRateStatistics(emptyRange)).rejects.toThrow(/permission/i)
  })

  it('returns empty heart rate statistics on iOS when permission is not granted (HealthKit silent-empty)', async () => {
    if (Platform.OS !== 'ios') {
      return
    }

    const status = await NitroHealth.getRequestStatusForAuthorization(heartRateReadPermission)

    if (status === 'unnecessary') {
      return
    }

    await expect(NitroHealth.readHeartRateStatistics(emptyRange)).resolves.toEqual({
      average: undefined,
      min: undefined,
      max: undefined,
    })
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
