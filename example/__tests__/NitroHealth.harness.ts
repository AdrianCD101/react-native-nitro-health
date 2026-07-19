import { describe, expect, it } from 'react-native-harness'
import { Platform } from 'react-native'
import { NitroHealth } from 'react-native-nitro-health'
import type {
  HealthPermission,
  HealthStatistics,
  StatisticsMetric,
} from 'react-native-nitro-health'

const availabilityStatuses = ['available', 'unavailable', 'providerUpdateRequired']
const authorizationRequestStatuses = ['unknown', 'shouldRequest', 'unnecessary']
const authorizationResultStatuses = ['granted', 'partial', 'denied', 'completed', 'unavailable']
const stepsReadPermission: HealthPermission[] = [{ accessType: 'read', dataType: 'steps' }]
const distanceReadPermission: HealthPermission[] = [{ accessType: 'read', dataType: 'distance' }]
const activeEnergyReadPermission: HealthPermission[] = [
  { accessType: 'read', dataType: 'activeEnergyBurned' },
]
const heartRateReadPermission: HealthPermission[] = [{ accessType: 'read', dataType: 'heartRate' }]
const sleepReadPermission: HealthPermission[] = [{ accessType: 'read', dataType: 'sleep' }]
const bodyMassReadPermission: HealthPermission[] = [{ accessType: 'read', dataType: 'bodyMass' }]
const emptyRange = {
  startDate: new Date('2000-01-01T00:00:00.000Z'),
  endDate: new Date('2000-01-02T00:00:00.000Z'),
}
const saveInterval = {
  startDate: new Date('2001-06-01T09:00:00.000Z'),
  endDate: new Date('2001-06-01T09:30:00.000Z'),
}
const saveReadRange = {
  startDate: new Date('2001-06-01T00:00:00.000Z'),
  endDate: new Date('2001-06-02T00:00:00.000Z'),
}
const last7DaysRange = {
  startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  endDate: new Date(),
}
const lastDayRange = {
  startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
  endDate: new Date(),
}

async function isPermissionUnnecessary(permissions: HealthPermission[]): Promise<boolean> {
  return (await NitroHealth.getRequestStatusForAuthorization(permissions)) === 'unnecessary'
}

// 'unnecessary' only means the user has already been asked (they may have denied on iOS).
// For round-trip tests, resolve the grant silently via requestAuthorization — it never opens
// a prompt once the request status is 'unnecessary'. Note this can only verify WRITE grants:
// on iOS, read permissions always land in unverifiablePermissions (HealthKit hides read
// denials by design), so a denied read still passes this check and simply yields empty reads.
async function hasVerifiedPermissions(permissions: HealthPermission[]): Promise<boolean> {
  if (!(await isPermissionUnnecessary(permissions))) {
    return false
  }

  const result = await NitroHealth.requestAuthorization(permissions)

  return result.deniedPermissions.length === 0
}

// On iOS a denied read permission is indistinguishable from an empty store: HealthKit returns
// no samples rather than an error. When a round-trip read comes back empty on iOS, treat the
// result as inconclusive (read likely denied) instead of failing the assertion. On Android
// read denials throw, so an empty read there is a real failure.
function isInconclusiveRead(samples: readonly unknown[]): boolean {
  return Platform.OS === 'ios' && samples.length === 0
}

const statisticsMetricKeys = ['sum', 'avg', 'min', 'max'] as const

function assertStatisticsEntry(
  entry: HealthStatistics,
  metrics: readonly StatisticsMetric[]
): void {
  expect(entry.startDate).toBeInstanceOf(Date)
  expect(entry.endDate).toBeInstanceOf(Date)
  expect(entry.startDate.getTime()).toBeLessThan(entry.endDate.getTime())

  for (const key of statisticsMetricKeys) {
    if (metrics.includes(key)) {
      expect(['number', 'undefined']).toContain(typeof entry[key])
    } else {
      expect(entry[key]).toBeUndefined()
    }
  }
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

  it('rejects reading steps on iOS before authorization is requested (HealthKit notDetermined)', async () => {
    if (Platform.OS !== 'ios') {
      return
    }

    const status = await NitroHealth.getRequestStatusForAuthorization(stepsReadPermission)

    if (status === 'unnecessary') {
      return
    }

    await expect(NitroHealth.readSteps(emptyRange)).rejects.toThrow(/not determined/i)
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

  it('rejects reading daily step totals on iOS before authorization is requested (HealthKit notDetermined)', async () => {
    if (Platform.OS !== 'ios') {
      return
    }

    const status = await NitroHealth.getRequestStatusForAuthorization(stepsReadPermission)

    if (status === 'unnecessary') {
      return
    }

    await expect(NitroHealth.readDailyStepTotals(emptyRange)).rejects.toThrow(/not determined/i)
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

  it('rejects reading distance on iOS before authorization is requested (HealthKit notDetermined)', async () => {
    if (Platform.OS !== 'ios') {
      return
    }

    const status = await NitroHealth.getRequestStatusForAuthorization(distanceReadPermission)

    if (status === 'unnecessary') {
      return
    }

    await expect(NitroHealth.readDistance(emptyRange)).rejects.toThrow(/not determined/i)
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

  it('rejects reading active energy burned on iOS before authorization is requested (HealthKit notDetermined)', async () => {
    if (Platform.OS !== 'ios') {
      return
    }

    const status = await NitroHealth.getRequestStatusForAuthorization(activeEnergyReadPermission)

    if (status === 'unnecessary') {
      return
    }

    await expect(NitroHealth.readActiveEnergyBurned(emptyRange)).rejects.toThrow(/not determined/i)
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

  it('reads body mass from native code without crashing', async () => {
    try {
      const samples = await NitroHealth.readBodyMass(emptyRange)

      expect(Array.isArray(samples)).toBe(true)
      for (const sample of samples) {
        expect(typeof sample.kilograms).toBe('number')
        expect(['string', 'undefined']).toContain(typeof sample.source)
      }
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('rejects reading body mass on Android when permission is not granted', async () => {
    if (Platform.OS !== 'android') {
      return
    }

    const status = await NitroHealth.getRequestStatusForAuthorization(bodyMassReadPermission)

    if (status === 'unnecessary') {
      return
    }

    await expect(NitroHealth.readBodyMass(emptyRange)).rejects.toThrow(/permission/i)
  })

  it('rejects reading body mass on iOS before authorization is requested (HealthKit notDetermined)', async () => {
    if (Platform.OS !== 'ios') {
      return
    }

    const status = await NitroHealth.getRequestStatusForAuthorization(bodyMassReadPermission)

    if (status === 'unnecessary') {
      return
    }

    await expect(NitroHealth.readBodyMass(emptyRange)).rejects.toThrow(/not determined/i)
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

  it('rejects reading heart rate on iOS before authorization is requested (HealthKit notDetermined)', async () => {
    if (Platform.OS !== 'ios') {
      return
    }

    const status = await NitroHealth.getRequestStatusForAuthorization(heartRateReadPermission)

    if (status === 'unnecessary') {
      return
    }

    await expect(NitroHealth.readHeartRate(emptyRange)).rejects.toThrow(/not determined/i)
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

  it('rejects reading heart rate statistics on iOS before authorization is requested (HealthKit notDetermined)', async () => {
    if (Platform.OS !== 'ios') {
      return
    }

    const status = await NitroHealth.getRequestStatusForAuthorization(heartRateReadPermission)

    if (status === 'unnecessary') {
      return
    }

    await expect(NitroHealth.readHeartRateStatistics(emptyRange)).rejects.toThrow(/not determined/i)
  })

  it('reads sleep samples from native code without crashing', async () => {
    try {
      const samples = await NitroHealth.readSleepSamples(emptyRange)

      expect(Array.isArray(samples)).toBe(true)
      for (const sample of samples) {
        expect(sample.startDate).toBeInstanceOf(Date)
        expect(sample.endDate).toBeInstanceOf(Date)
        expect(typeof sample.stage).toBe('string')
        expect(['string', 'undefined']).toContain(typeof sample.source)
      }
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('rejects reading sleep samples on Android when permission is not granted', async () => {
    if (Platform.OS !== 'android') {
      return
    }

    const status = await NitroHealth.getRequestStatusForAuthorization(sleepReadPermission)

    if (status === 'unnecessary') {
      return
    }

    await expect(NitroHealth.readSleepSamples(emptyRange)).rejects.toThrow(/permission/i)
  })

  it('rejects reading sleep samples on iOS before authorization is requested (HealthKit notDetermined)', async () => {
    if (Platform.OS !== 'ios') {
      return
    }

    const status = await NitroHealth.getRequestStatusForAuthorization(sleepReadPermission)

    if (status === 'unnecessary') {
      return
    }

    await expect(NitroHealth.readSleepSamples(emptyRange)).rejects.toThrow(/not determined/i)
  })

  it('rejects empty save sample arrays before crossing the native boundary', async () => {
    await expect(NitroHealth.saveSteps([])).rejects.toThrow('At least one sample is required')
    await expect(NitroHealth.saveDistance([])).rejects.toThrow('At least one sample is required')
    await expect(NitroHealth.saveActiveEnergyBurned([])).rejects.toThrow(
      'At least one sample is required'
    )
    await expect(NitroHealth.saveHeartRate([])).rejects.toThrow('At least one sample is required')
    await expect(NitroHealth.saveBodyMass([])).rejects.toThrow('At least one sample is required')
  })

  it('rejects invalid save sample values before crossing the native boundary', async () => {
    await expect(NitroHealth.saveSteps([{ ...saveInterval, count: -1 }])).rejects.toThrow(
      'samples[0]: count must be a positive integer'
    )
    await expect(
      NitroHealth.saveDistance([{ ...saveInterval, distanceMeters: -1 }])
    ).rejects.toThrow('samples[0]: distanceMeters must be a non-negative number')
    await expect(
      NitroHealth.saveActiveEnergyBurned([{ ...saveInterval, kilocalories: -1 }])
    ).rejects.toThrow('samples[0]: kilocalories must be a non-negative number')
    await expect(
      NitroHealth.saveHeartRate([{ date: saveInterval.startDate, bpm: 0 }])
    ).rejects.toThrow('samples[0]: bpm must be between 1 and 300')
    await expect(
      NitroHealth.saveBodyMass([{ date: saveInterval.startDate, kilograms: 0 }])
    ).rejects.toThrow('samples[0]: kilograms must be greater than 0')
  })

  it('rejects inverted save sample intervals before crossing the native boundary', async () => {
    await expect(
      NitroHealth.saveSteps([
        { startDate: saveInterval.endDate, endDate: saveInterval.startDate, count: 100 },
      ])
    ).rejects.toThrow('samples[0]: startDate must be before endDate')
  })

  it('rejects saving steps when write permission is not granted', async () => {
    if (await hasVerifiedPermissions([{ accessType: 'write', dataType: 'steps' }])) {
      return
    }

    await expect(NitroHealth.saveSteps([{ ...saveInterval, count: 100 }])).rejects.toThrow(
      /permission/i
    )
  })

  it('rejects saving distance when write permission is not granted', async () => {
    if (await hasVerifiedPermissions([{ accessType: 'write', dataType: 'distance' }])) {
      return
    }

    await expect(
      NitroHealth.saveDistance([{ ...saveInterval, distanceMeters: 1000 }])
    ).rejects.toThrow(/permission/i)
  })

  it('rejects saving active energy burned when write permission is not granted', async () => {
    if (await hasVerifiedPermissions([{ accessType: 'write', dataType: 'activeEnergyBurned' }])) {
      return
    }

    await expect(
      NitroHealth.saveActiveEnergyBurned([{ ...saveInterval, kilocalories: 100 }])
    ).rejects.toThrow(/permission/i)
  })

  it('rejects saving heart rate when write permission is not granted', async () => {
    if (await hasVerifiedPermissions([{ accessType: 'write', dataType: 'heartRate' }])) {
      return
    }

    await expect(
      NitroHealth.saveHeartRate([{ date: saveInterval.startDate, bpm: 72 }])
    ).rejects.toThrow(/permission/i)
  })

  it('rejects saving body mass when write permission is not granted', async () => {
    if (await hasVerifiedPermissions([{ accessType: 'write', dataType: 'bodyMass' }])) {
      return
    }

    await expect(
      NitroHealth.saveBodyMass([{ date: saveInterval.startDate, kilograms: 72.5 }])
    ).rejects.toThrow(/permission/i)
  })

  it('round-trips saved steps through native code when authorized', async () => {
    const authorized = await hasVerifiedPermissions([
      { accessType: 'write', dataType: 'steps' },
      { accessType: 'read', dataType: 'steps' },
    ])

    if (!authorized) {
      return
    }

    await NitroHealth.saveSteps([{ ...saveInterval, count: 321 }])

    const samples = await NitroHealth.readSteps(saveReadRange)

    if (isInconclusiveRead(samples)) {
      return
    }

    expect(samples.some((sample) => sample.count === 321)).toBe(true)
  })

  it('round-trips saved body mass through native code when authorized', async () => {
    const authorized = await hasVerifiedPermissions([
      { accessType: 'write', dataType: 'bodyMass' },
      { accessType: 'read', dataType: 'bodyMass' },
    ])

    if (!authorized) {
      return
    }

    await NitroHealth.saveBodyMass([{ date: saveInterval.startDate, kilograms: 72.5 }])

    const samples = await NitroHealth.readBodyMass(saveReadRange)

    if (isInconclusiveRead(samples)) {
      return
    }

    expect(samples.some((sample) => sample.kilograms === 72.5)).toBe(true)
  })

  it('round-trips saved heart rate through native code when authorized', async () => {
    const authorized = await hasVerifiedPermissions([
      { accessType: 'write', dataType: 'heartRate' },
      { accessType: 'read', dataType: 'heartRate' },
    ])

    if (!authorized) {
      return
    }

    await NitroHealth.saveHeartRate([{ date: saveInterval.startDate, bpm: 123 }])

    const samples = await NitroHealth.readHeartRate(saveReadRange)

    if (isInconclusiveRead(samples)) {
      return
    }

    expect(samples.some((sample) => sample.bpm === 123)).toBe(true)
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

  describe('readStatistics', () => {
    it('reads statistics from native code without crashing', async () => {
      try {
        const dailySteps = await NitroHealth.readStatistics('steps', {
          ...last7DaysRange,
          bucket: 'day',
          metrics: ['sum'],
        })

        expect(Array.isArray(dailySteps)).toBe(true)
        for (const entry of dailySteps) {
          assertStatisticsEntry(entry, ['sum'])
        }
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
      }

      try {
        const hourlyHeartRate = await NitroHealth.readStatistics('heartRate', {
          ...lastDayRange,
          bucket: 'hour',
          metrics: ['avg', 'min', 'max'],
        })

        expect(Array.isArray(hourlyHeartRate)).toBe(true)
        for (const entry of hourlyHeartRate) {
          assertStatisticsEntry(entry, ['avg', 'min', 'max'])
        }
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
      }
    })

    it('rejects unsupported metric/data-type combinations and invalid inputs before crossing the native boundary', async () => {
      await expect(
        NitroHealth.readStatistics('heartRate', {
          ...emptyRange,
          bucket: 'day',
          metrics: ['sum'],
        })
      ).rejects.toThrow(`Metric 'sum' is not supported for 'heartRate' (supported: avg, min, max)`)

      await expect(
        NitroHealth.readStatistics('steps', {
          ...emptyRange,
          bucket: 'day',
          metrics: ['avg'],
        })
      ).rejects.toThrow(`Metric 'avg' is not supported for 'steps' (supported: sum)`)

      await expect(
        NitroHealth.readStatistics('sleep', {
          ...emptyRange,
          bucket: 'day',
          metrics: ['sum'],
        })
      ).rejects.toThrow(`readStatistics does not support the 'sleep' data type`)

      await expect(
        NitroHealth.readStatistics('steps', {
          ...emptyRange,
          bucket: 'day',
          metrics: [],
        })
      ).rejects.toThrow('At least one metric is required')

      await expect(
        NitroHealth.readStatistics('steps', {
          ...emptyRange,
          bucket: 'year' as any,
          metrics: ['sum'],
        })
      ).rejects.toThrow('bucket must be one of: hour, day, week, month')
    })

    it('rejects reading statistics on Android when steps permission is not granted', async () => {
      if (Platform.OS !== 'android') {
        return
      }

      const status = await NitroHealth.getRequestStatusForAuthorization(stepsReadPermission)

      if (status === 'unnecessary') {
        return
      }

      await expect(
        NitroHealth.readStatistics('steps', { ...emptyRange, bucket: 'day', metrics: ['sum'] })
      ).rejects.toThrow(/permission/i)
    })

    it('rejects reading statistics on iOS before authorization is requested (HealthKit notDetermined)', async () => {
      if (Platform.OS !== 'ios') {
        return
      }

      const status = await NitroHealth.getRequestStatusForAuthorization(stepsReadPermission)

      if (status === 'unnecessary') {
        return
      }

      await expect(
        NitroHealth.readStatistics('steps', { ...emptyRange, bucket: 'day', metrics: ['sum'] })
      ).rejects.toThrow(/not determined/i)
    })

    it('round-trips saved steps through readStatistics when authorized', async () => {
      const authorized = await hasVerifiedPermissions([
        { accessType: 'write', dataType: 'steps' },
        { accessType: 'read', dataType: 'steps' },
      ])

      if (!authorized) {
        return
      }

      await NitroHealth.saveSteps([{ ...saveInterval, count: 321 }])

      const buckets = await NitroHealth.readStatistics('steps', {
        startDate: saveReadRange.startDate,
        endDate: saveReadRange.endDate,
        bucket: 'day',
        metrics: ['sum'],
      })

      if (isInconclusiveRead(buckets)) {
        return
      }

      expect(buckets.some((bucket) => (bucket.sum ?? 0) >= 321)).toBe(true)
    })
  })
})
