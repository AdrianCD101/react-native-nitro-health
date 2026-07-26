import { Platform } from 'react-native'
import { describe, expect, it } from 'react-native-harness'
import { NitroHealth } from 'react-native-nitro-health'

import {
  deleteInterval,
  deleteReadRange,
  emptyRange,
  hasVerifiedPermissions,
  isInconclusiveRead,
} from './support/harnessSupport'

// A valid, well-formed uuid that no HealthKit/Health Connect record will ever carry (both
// platforms generate random ids). Used to observe the platform-specific no-match behavior.
const nonexistentUuid = '00000000-0000-4000-8000-000000000000'

describe('NitroHealth deletes (native)', () => {
  it('rejects empty uuid arrays before crossing the native boundary', async () => {
    await expect(NitroHealth.deleteSamplesByUuids('steps', [])).rejects.toThrow(
      'At least one uuid is required'
    )
  })

  it('rejects synthetic reading ids before crossing the native boundary', async () => {
    await expect(NitroHealth.deleteSamplesByUuids('heartRate', ['abc#0'])).rejects.toThrow(
      "uuids[0]: synthetic reading ids (record id + '#index') cannot be deleted individually; use deleteSamplesByTimeRange instead"
    )
  })

  it('rejects deleting steps when write permission is not granted', async () => {
    if (await hasVerifiedPermissions([{ accessType: 'write', dataType: 'steps' }])) {
      return
    }

    await expect(NitroHealth.deleteSamplesByUuids('steps', [nonexistentUuid])).rejects.toThrow(
      /permission/i
    )
    await expect(NitroHealth.deleteSamplesByTimeRange('steps', deleteReadRange)).rejects.toThrow(
      /permission/i
    )
  })

  it('resolves time-range deletes that match nothing', async () => {
    const authorized = await hasVerifiedPermissions([{ accessType: 'write', dataType: 'steps' }])

    if (!authorized) {
      return
    }

    await expect(NitroHealth.deleteSamplesByTimeRange('steps', emptyRange)).resolves.toBeUndefined()
  })

  it('resolves uuid deletes that match nothing on iOS', async () => {
    // Pins the on-device errorNoData normalization: Apple leaves the no-match behavior of
    // deleteObjects undefined, and the Swift bridge maps errorNoData to success.
    if (Platform.OS !== 'ios') {
      return
    }

    const authorized = await hasVerifiedPermissions([{ accessType: 'write', dataType: 'steps' }])

    if (!authorized) {
      return
    }

    await expect(
      NitroHealth.deleteSamplesByUuids('steps', [nonexistentUuid])
    ).resolves.toBeUndefined()
  })

  it('rejects uuid deletes of nonexistent records on Android', async () => {
    // Health Connect delete-by-id is transactional and reports unknown ids as a failure —
    // the asymmetry with iOS documented in the README.
    if (Platform.OS !== 'android') {
      return
    }

    const authorized = await hasVerifiedPermissions([{ accessType: 'write', dataType: 'steps' }])

    if (!authorized) {
      return
    }

    await expect(NitroHealth.deleteSamplesByUuids('steps', [nonexistentUuid])).rejects.toThrow()
  })

  it('round-trips save, delete by uuid, and re-read for steps', async () => {
    const authorized = await hasVerifiedPermissions([
      { accessType: 'write', dataType: 'steps' },
      { accessType: 'read', dataType: 'steps' },
    ])

    if (!authorized) {
      return
    }

    await NitroHealth.saveSteps([{ ...deleteInterval, count: 4321 }])

    const page = await NitroHealth.readSteps(deleteReadRange)

    if (isInconclusiveRead(page.samples)) {
      return
    }

    const saved = page.samples.find((sample) => sample.count === 4321)

    expect(saved).toBeDefined()

    if (saved === undefined) {
      return
    }

    await NitroHealth.deleteSamplesByUuids('steps', [saved.uuid])

    const afterDelete = await NitroHealth.readSteps(deleteReadRange)

    expect(afterDelete.samples.some((sample) => sample.uuid === saved.uuid)).toBe(false)
  })

  it('round-trips save, delete by time range, and re-read for steps', async () => {
    const authorized = await hasVerifiedPermissions([
      { accessType: 'write', dataType: 'steps' },
      { accessType: 'read', dataType: 'steps' },
    ])

    if (!authorized) {
      return
    }

    await NitroHealth.saveSteps([{ ...deleteInterval, count: 4322 }])

    const page = await NitroHealth.readSteps(deleteReadRange)

    if (isInconclusiveRead(page.samples)) {
      return
    }

    expect(page.samples.some((sample) => sample.count === 4322)).toBe(true)

    await NitroHealth.deleteSamplesByTimeRange('steps', deleteReadRange)

    const afterDelete = await NitroHealth.readSteps(deleteReadRange)

    expect(afterDelete.samples.some((sample) => sample.count === 4322)).toBe(false)
  })

  it('deletes individual heart-rate samples by uuid on iOS', async () => {
    // On iOS every heart-rate reading is its own HKQuantitySample with a real UUID, so
    // per-sample deletion works — the counterpart to Android's synthetic-id rejection below.
    if (Platform.OS !== 'ios') {
      return
    }

    const authorized = await hasVerifiedPermissions([
      { accessType: 'write', dataType: 'heartRate' },
      { accessType: 'read', dataType: 'heartRate' },
    ])

    if (!authorized) {
      return
    }

    const siblingDate = new Date(deleteInterval.startDate.getTime() + 5 * 60 * 1000)

    await NitroHealth.saveHeartRate([
      { date: deleteInterval.startDate, bpm: 124 },
      { date: siblingDate, bpm: 125 },
    ])

    const page = await NitroHealth.readHeartRate(deleteReadRange)

    if (isInconclusiveRead(page.samples)) {
      return
    }

    const target = page.samples.find((sample) => sample.bpm === 124)

    expect(target).toBeDefined()

    if (target === undefined) {
      return
    }

    await NitroHealth.deleteSamplesByUuids('heartRate', [target.uuid])

    const afterDelete = await NitroHealth.readHeartRate(deleteReadRange)

    expect(afterDelete.samples.some((sample) => sample.uuid === target.uuid)).toBe(false)
    expect(afterDelete.samples.some((sample) => sample.bpm === 125)).toBe(true)
  })

  it('rejects synthetic heart-rate uuids on Android and keeps the parent record', async () => {
    // Observes the real on-device contract: heart-rate readings carry synthetic
    // "<recordId>#<index>" ids, deleting by one must reject (never delete the parent record),
    // and time-range deletion is the working alternative.
    if (Platform.OS !== 'android') {
      return
    }

    const authorized = await hasVerifiedPermissions([
      { accessType: 'write', dataType: 'heartRate' },
      { accessType: 'read', dataType: 'heartRate' },
    ])

    if (!authorized) {
      return
    }

    await NitroHealth.saveHeartRate([{ date: deleteInterval.startDate, bpm: 124 }])

    const page = await NitroHealth.readHeartRate(deleteReadRange)
    const target = page.samples.find((sample) => sample.bpm === 124)

    expect(target).toBeDefined()

    if (target === undefined) {
      return
    }

    expect(target.uuid).toContain('#')

    await expect(NitroHealth.deleteSamplesByUuids('heartRate', [target.uuid])).rejects.toThrow(
      "synthetic reading ids (record id + '#index') cannot be deleted individually; use deleteSamplesByTimeRange instead"
    )

    const afterRejectedDelete = await NitroHealth.readHeartRate(deleteReadRange)

    expect(afterRejectedDelete.samples.some((sample) => sample.bpm === 124)).toBe(true)

    await NitroHealth.deleteSamplesByTimeRange('heartRate', deleteReadRange)

    const afterRangeDelete = await NitroHealth.readHeartRate(deleteReadRange)

    expect(afterRangeDelete.samples.some((sample) => sample.bpm === 124)).toBe(false)
  })
})
