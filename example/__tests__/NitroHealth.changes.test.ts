import { mockNitroHealth } from './support/mockNitroHealth'

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

  it('maps ordered upserts and deletions with record identity', async () => {
    const startTimeMs = Date.parse('2026-01-01T00:00:00.000Z')
    const endTimeMs = Date.parse('2026-01-01T01:00:00.000Z')
    mockNitroHealth.getChanges.mockResolvedValue({
      changes: [
        {
          type: 'upsert',
          recordUuid: 'record-1',
          stepSamples: [
            {
              uuid: 'record-1',
              startTimeMs,
              endTimeMs,
              count: 123,
            },
          ],
        },
        {
          type: 'delete',
          recordUuid: 'record-2',
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
          recordUuid: 'record-1',
          samples: [
            {
              uuid: 'record-1',
              recordUuid: 'record-1',
              startDate: new Date(startTimeMs),
              endDate: new Date(endTimeMs),
              count: 123,
            },
          ],
        },
        {
          type: 'delete',
          recordUuid: 'record-2',
        },
      ],
      nextChangesToken: 'next-token',
      hasMore: true,
    })
    expect(mockNitroHealth.getChanges).toHaveBeenCalledWith('steps', 'current-token')
  })

  it('keeps flattened samples grouped under their parent record', async () => {
    const timeMs = Date.parse('2026-01-01T00:00:00.000Z')
    mockNitroHealth.getChanges.mockResolvedValue({
      changes: [
        {
          type: 'upsert',
          recordUuid: 'heart-record',
          heartRateSamples: [
            {
              uuid: 'heart-record#0',
              recordUuid: 'heart-record',
              timeMs,
              bpm: 72,
            },
            {
              uuid: 'heart-record#1',
              recordUuid: 'heart-record',
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

    if (result.tokenExpired) {
      throw new Error('Expected a successful changes result')
    }

    const change = result.changes[0]
    if (change.type !== 'upsert') {
      throw new Error('Expected an upsert change')
    }

    expect(change.samples.map((sample) => sample.recordUuid)).toEqual([
      'heart-record',
      'heart-record',
    ])
  })

  it('preserves an empty heart-rate upsert so cached children can be cleared', async () => {
    mockNitroHealth.getChanges.mockResolvedValue({
      changes: [
        {
          type: 'upsert',
          recordUuid: 'heart-record',
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
          recordUuid: 'heart-record',
          samples: [],
        },
      ],
      nextChangesToken: 'next-token',
      hasMore: false,
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
          recordUuid: 'record-1',
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
})
