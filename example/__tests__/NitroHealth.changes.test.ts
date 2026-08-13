import {
  mockNitroHealth,
  nativeRecordChildMetadata,
  nativeRecordMetadata,
} from './support/mockNitroHealth'

jest.mock('react-native-nitro-modules', () => ({
  NitroModules: {
    createHybridObject: jest.fn(() => mockNitroHealth),
  },
}))

import { NitroHealth } from 'react-native-nitro-health'

describe('NitroHealth changes contract', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('creates a token scoped to one data type', async () => {
    mockNitroHealth.createChangesToken.mockResolvedValue('opaque-token')

    await expect(NitroHealth.createChangesToken('steps')).resolves.toBe('opaque-token')
    expect(mockNitroHealth.createChangesToken).toHaveBeenCalledWith('steps')
  })

  it('rejects an empty token before crossing the bridge', async () => {
    await expect(NitroHealth.getChanges('steps', '  ')).rejects.toThrow(
      'changesToken must be a non-empty string'
    )
    expect(mockNitroHealth.getChanges).not.toHaveBeenCalled()
  })

  it('maps ordered upserts and deletions to public record identities', async () => {
    const startTimeMs = Date.parse('2026-01-01T00:00:00.000Z')
    const endTimeMs = Date.parse('2026-01-01T01:00:00.000Z')
    mockNitroHealth.getChanges.mockResolvedValue({
      changes: [
        {
          type: 'upsert',
          recordId: 'record-1',
          stepSamples: [
            {
              ...nativeRecordMetadata('record-1', 'com.example.health', 'Example Health'),
              startTimeMs,
              endTimeMs,
              count: 123,
            },
          ],
        },
        {
          type: 'delete',
          recordId: 'record-2',
        },
      ],
      nextChangesToken: 'next-token',
      hasMore: true,
      tokenExpired: false,
    })

    await expect(NitroHealth.getChanges('steps', 'current-token')).resolves.toEqual({
      tokenExpired: false,
      changes: [
        {
          type: 'upsert',
          record: { kind: 'record', id: 'record-1' },
          samples: [
            {
              identity: { kind: 'record', id: 'record-1' },
              origin: { identifier: 'com.example.health', displayName: 'Example Health' },
              startDate: new Date(startTimeMs),
              endDate: new Date(endTimeMs),
              count: 123,
            },
          ],
        },
        {
          type: 'delete',
          record: { kind: 'record', id: 'record-2' },
        },
      ],
      nextChangesToken: 'next-token',
      hasMore: true,
    })
    expect(mockNitroHealth.getChanges).toHaveBeenCalledWith('steps', 'current-token')
  })

  it('keeps flattened sample identities grouped under their parent record', async () => {
    const timeMs = Date.parse('2026-01-01T00:00:00.000Z')
    mockNitroHealth.getChanges.mockResolvedValue({
      changes: [
        {
          type: 'upsert',
          recordId: 'heart-record',
          heartRateSamples: [
            {
              ...nativeRecordChildMetadata('heart-record#0', 'heart-record'),
              timeMs,
              bpm: 72,
            },
            {
              ...nativeRecordChildMetadata('heart-record#1', 'heart-record'),
              timeMs: timeMs + 1000,
              bpm: 73,
            },
          ],
        },
      ],
      nextChangesToken: 'next-token',
      hasMore: false,
      tokenExpired: false,
    })

    const result = await NitroHealth.getChanges('heartRate', 'current-token')

    if (result.tokenExpired) throw new Error('Expected a successful changes result')
    const change = result.changes[0]
    if (change === undefined || change.type !== 'upsert') {
      throw new Error('Expected an upsert change')
    }

    expect(change.record).toEqual({ kind: 'record', id: 'heart-record' })
    expect(change.samples.map((sample) => sample.identity)).toEqual([
      {
        kind: 'record-child',
        id: 'heart-record#0',
        record: { kind: 'record', id: 'heart-record' },
      },
      {
        kind: 'record-child',
        id: 'heart-record#1',
        record: { kind: 'record', id: 'heart-record' },
      },
    ])
  })

  it('maps Android blood pressure metadata on upserts', async () => {
    const timeMs = Date.parse('2026-01-01T09:00:00.000Z')
    mockNitroHealth.getChanges.mockResolvedValue({
      changes: [
        {
          type: 'upsert',
          recordId: 'bp-record',
          bloodPressureSamples: [
            {
              ...nativeRecordMetadata('bp-record'),
              timeMs,
              systolicMmHg: 118,
              diastolicMmHg: 76,
              androidBodyPosition: 'sittingDown',
              androidMeasurementLocation: 'leftUpperArm',
            },
          ],
        },
      ],
      nextChangesToken: 'next-token',
      hasMore: false,
      tokenExpired: false,
    })

    const result = await NitroHealth.getChanges('bloodPressure', 'current-token')
    if (result.tokenExpired) throw new Error('Expected a successful changes result')

    expect(result.changes[0]).toMatchObject({
      type: 'upsert',
      samples: [
        {
          metadata: {
            android: {
              bodyPosition: 'sitting_down',
              measurementLocation: 'left_upper_arm',
            },
          },
        },
      ],
    })
  })

  it('maps blood glucose metadata on upserts', async () => {
    const timeMs = Date.parse('2026-01-01T09:00:00.000Z')
    mockNitroHealth.getChanges.mockResolvedValue({
      changes: [
        {
          type: 'upsert',
          recordId: 'bg-record',
          bloodGlucoseSamples: [
            {
              ...nativeRecordMetadata('bg-record'),
              timeMs,
              millimolesPerLiter: 5.4,
              iosMealTime: 'postprandial',
            },
          ],
        },
      ],
      nextChangesToken: 'next-token',
      hasMore: false,
      tokenExpired: false,
    })

    const result = await NitroHealth.getChanges('bloodGlucose', 'current-token')
    if (result.tokenExpired) throw new Error('Expected a successful changes result')

    expect(result.changes[0]).toMatchObject({
      type: 'upsert',
      samples: [{ metadata: { ios: { mealTime: 'postprandial' } } }],
    })
  })

  it('preserves an empty heart-rate upsert so cached children can be cleared', async () => {
    mockNitroHealth.getChanges.mockResolvedValue({
      changes: [
        {
          type: 'upsert',
          recordId: 'heart-record',
          heartRateSamples: [],
        },
      ],
      nextChangesToken: 'next-token',
      hasMore: false,
      tokenExpired: false,
    })

    await expect(NitroHealth.getChanges('heartRate', 'current-token')).resolves.toEqual({
      tokenExpired: false,
      changes: [
        {
          type: 'upsert',
          record: { kind: 'record', id: 'heart-record' },
          samples: [],
        },
      ],
      nextChangesToken: 'next-token',
      hasMore: false,
    })
  })

  it('preserves distance, floors climbed, tagged sleep, and workout semantics in upserts', async () => {
    const startTimeMs = Date.parse('2026-01-01T00:00:00.000Z')
    const endTimeMs = Date.parse('2026-01-01T08:00:00.000Z')
    type NativeChangesResult = Awaited<ReturnType<typeof mockNitroHealth.getChanges>>
    const changePage = (change: NativeChangesResult['changes'][number]): NativeChangesResult => ({
      changes: [change],
      nextChangesToken: 'next-token',
      hasMore: false,
      tokenExpired: false,
    })

    mockNitroHealth.getChanges
      .mockResolvedValueOnce(
        changePage({
          type: 'upsert',
          recordId: 'distance-record',
          distanceSamples: [
            {
              ...nativeRecordMetadata('distance-record'),
              startTimeMs,
              endTimeMs,
              distanceMeters: 5000,
              scope: 'walkingRunning',
            },
          ],
        })
      )
      .mockResolvedValueOnce(
        changePage({
          type: 'upsert',
          recordId: 'floors-record',
          floorsClimbedSamples: [
            {
              ...nativeRecordMetadata('floors-record'),
              startTimeMs,
              endTimeMs,
              floors: 12.5,
            },
          ],
        })
      )
      .mockResolvedValueOnce(
        changePage({
          type: 'upsert',
          recordId: 'sleep-record',
          sleepSamples: [
            {
              ...nativeRecordMetadata('sleep-record'),
              kind: 'sessionEnvelope',
              startTimeMs,
              endTimeMs,
              stageData: 'reported',
            },
            {
              ...nativeRecordChildMetadata('sleep-record#stage-0', 'sleep-record'),
              kind: 'stage',
              startTimeMs,
              endTimeMs,
              stage: 'inBed',
            },
          ],
        })
      )
      .mockResolvedValueOnce(
        changePage({
          type: 'upsert',
          recordId: 'workout-record',
          workoutSamples: [
            {
              ...nativeRecordMetadata('workout-record'),
              startTimeMs,
              endTimeMs,
              elapsedDurationSeconds: 28800,
              activeDuration: { status: 'available', value: 2700 },
              activity: {
                status: 'known',
                type: 'running',
                portability: 'portable',
                mapping: 'exact',
              },
              totalDistance: { status: 'available', value: 5000 },
              totalActiveEnergyBurned: { status: 'unsupported' },
            },
          ],
        })
      )

    const distance = await NitroHealth.getChanges('distance', 'distance-token')
    const floors = await NitroHealth.getChanges('floorsClimbed', 'floors-token')
    const sleep = await NitroHealth.getChanges('sleep', 'sleep-token')
    const workout = await NitroHealth.getChanges('workout', 'workout-token')

    if (
      distance.tokenExpired ||
      floors.tokenExpired ||
      sleep.tokenExpired ||
      workout.tokenExpired
    ) {
      throw new Error('Expected successful change pages')
    }
    expect(distance.changes[0]).toMatchObject({
      record: { kind: 'record', id: 'distance-record' },
      samples: [{ scope: 'walking-running', distanceMeters: 5000 }],
    })
    expect(floors.changes[0]).toMatchObject({
      record: { kind: 'record', id: 'floors-record' },
      samples: [
        {
          floors: 12.5,
          startDate: new Date(startTimeMs),
          endDate: new Date(endTimeMs),
        },
      ],
    })
    expect(sleep.changes[0]).toMatchObject({
      record: { kind: 'record', id: 'sleep-record' },
      samples: [
        { kind: 'session-envelope', stageData: 'reported' },
        {
          kind: 'stage',
          stage: 'inBed',
          identity: {
            kind: 'record-child',
            record: { kind: 'record', id: 'sleep-record' },
          },
        },
      ],
    })
    expect(workout.changes[0]).toMatchObject({
      record: { kind: 'record', id: 'workout-record' },
      samples: [
        {
          elapsedDurationSeconds: 28800,
          activeDuration: { status: 'available', value: 2700 },
          activity: { status: 'known', type: 'running', mapping: 'exact' },
          totalDistance: { status: 'available', value: 5000 },
          totalActiveEnergyBurned: { status: 'unsupported' },
        },
      ],
    })
  })

  it('returns a distinct expired-token state', async () => {
    mockNitroHealth.getChanges.mockResolvedValue({
      changes: [],
      hasMore: false,
      tokenExpired: true,
    })

    await expect(NitroHealth.getChanges('steps', 'expired-token')).resolves.toEqual({
      tokenExpired: true,
    })
  })

  it('rejects a mismatched native payload without surfacing its next token', async () => {
    mockNitroHealth.getChanges.mockResolvedValue({
      changes: [
        {
          type: 'upsert',
          recordId: 'record-1',
          distanceSamples: [],
        },
      ],
      nextChangesToken: 'must-not-surface',
      hasMore: false,
      tokenExpired: false,
    })

    await expect(NitroHealth.getChanges('steps', 'current-token')).rejects.toThrow(
      "Native 'steps' upsert is missing samples"
    )
  })

  it('rejects samples whose parent identity does not match the changed record', async () => {
    const startTimeMs = Date.parse('2026-01-01T00:00:00.000Z')
    const endTimeMs = Date.parse('2026-01-01T01:00:00.000Z')
    mockNitroHealth.getChanges.mockResolvedValue({
      changes: [
        {
          type: 'upsert',
          recordId: 'record-1',
          stepSamples: [
            {
              ...nativeRecordMetadata('different-record'),
              startTimeMs,
              endTimeMs,
              count: 123,
            },
          ],
        },
      ],
      nextChangesToken: 'must-not-surface',
      hasMore: false,
      tokenExpired: false,
    })

    await expect(NitroHealth.getChanges('steps', 'current-token')).rejects.toThrow(
      "Native 'steps' upsert samples do not match recordId"
    )
  })
})
