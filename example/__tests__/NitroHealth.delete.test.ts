import { mockNitroHealth } from './support/mockNitroHealth'

jest.mock('react-native-nitro-modules', () => ({
  NitroModules: {
    createHybridObject: jest.fn(() => mockNitroHealth),
  },
}))

import { NitroHealth } from 'react-native-nitro-health'

describe('NitroHealth delete contract', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('deletes independently deletable records and reports a known count', async () => {
    const records = [
      { kind: 'record' as const, id: 'record-1' },
      { kind: 'record' as const, id: 'record-2' },
    ]
    mockNitroHealth.deleteRecordsByIds.mockResolvedValue({
      status: 'completed',
      deletedCountStatus: 'known',
      deletedCount: 2,
    })

    await expect(NitroHealth.deleteRecordsByIds('steps', records)).resolves.toEqual({
      status: 'completed',
      requestedCount: 2,
      deletedCount: { status: 'known', value: 2 },
    })
    expect(mockNitroHealth.deleteRecordsByIds).toHaveBeenCalledWith('steps', [
      'record-1',
      'record-2',
    ])
  })

  it('preserves an unverifiable identity deletion count', async () => {
    mockNitroHealth.deleteRecordsByIds.mockResolvedValue({
      status: 'completed',
      deletedCountStatus: 'unverifiable',
    })

    await expect(
      NitroHealth.deleteRecordsByIds('heartRate', [{ kind: 'record', id: 'heart-record' }])
    ).resolves.toEqual({
      status: 'completed',
      requestedCount: 1,
      deletedCount: { status: 'unverifiable' },
    })
  })

  it('rejects a native no-match-or-ownership identity outcome', async () => {
    mockNitroHealth.deleteRecordsByIds.mockResolvedValue({
      status: 'notFoundOrNotOwned',
      deletedCountStatus: 'unverifiable',
    })

    await expect(
      NitroHealth.deleteRecordsByIds('sleep', [{ kind: 'record', id: 'foreign-record' }])
    ).rejects.toThrow('Identity deletion returned an unsupported native status')
  })

  it('deletes caller-owned records by time range with typed count visibility', async () => {
    const startDate = new Date('2026-01-01T09:00:00.000Z')
    const endDate = new Date('2026-01-01T09:30:00.000Z')
    mockNitroHealth.deleteRecordsByTimeRange.mockResolvedValue({
      status: 'completed',
      deletedCountStatus: 'known',
      deletedCount: 3,
    })

    await expect(
      NitroHealth.deleteRecordsByTimeRange('heartRate', { startDate, endDate })
    ).resolves.toEqual({
      status: 'completed',
      deletedCount: { status: 'known', value: 3 },
    })
    expect(mockNitroHealth.deleteRecordsByTimeRange).toHaveBeenCalledWith('heartRate', {
      startTimeMs: startDate.getTime(),
      endTimeMs: endDate.getTime(),
    })
  })

  it('rejects child, invalid, and duplicate identities before crossing native', async () => {
    await expect(
      NitroHealth.deleteRecordsByIds('heartRate', [
        {
          kind: 'record-child',
          id: 'heart-record#0',
          record: { kind: 'record', id: 'heart-record' },
        } as never,
      ])
    ).rejects.toThrow('records[0]: an independently deletable record identity is required')
    await expect(
      NitroHealth.deleteRecordsByIds('steps', [{ kind: 'record', id: '  ' }])
    ).rejects.toThrow('records[0]: an independently deletable record identity is required')
    await expect(NitroHealth.deleteRecordsByIds('steps', [null as never])).rejects.toThrow(
      'records[0]: an independently deletable record identity is required'
    )
    await expect(
      NitroHealth.deleteRecordsByIds('steps', [
        { kind: 'record', id: 'record-1' },
        { kind: 'record', id: 'record-1' },
      ])
    ).rejects.toThrow("records[1]: duplicate record identity 'record-1'")

    expect(mockNitroHealth.deleteRecordsByIds).not.toHaveBeenCalled()
  })

  it('rejects an empty identity list and invalid time ranges before crossing native', async () => {
    const endDate = new Date('2026-01-01T09:30:00.000Z')

    await expect(NitroHealth.deleteRecordsByIds('steps', [])).rejects.toThrow(
      'At least one record identity is required'
    )
    await expect(
      NitroHealth.deleteRecordsByTimeRange('steps', {
        startDate: new Date(Number.NaN),
        endDate,
      })
    ).rejects.toThrow('A valid startDate is required')
    await expect(
      NitroHealth.deleteRecordsByTimeRange('steps', { startDate: endDate, endDate })
    ).rejects.toThrow('startDate must be before endDate')

    expect(mockNitroHealth.deleteRecordsByIds).not.toHaveBeenCalled()
    expect(mockNitroHealth.deleteRecordsByTimeRange).not.toHaveBeenCalled()
  })

  it('rejects read-only and unknown data types before crossing native', async () => {
    const range = {
      startDate: new Date('2026-01-01T09:00:00.000Z'),
      endDate: new Date('2026-01-01T09:30:00.000Z'),
    }

    await expect(
      NitroHealth.deleteRecordsByIds('heartRateVariability' as never, [
        { kind: 'record', id: 'record-1' },
      ])
    ).rejects.toThrow(`'heartRateVariability' is not a writable health data type`)
    await expect(
      NitroHealth.deleteRecordsByTimeRange('heartRateVariability' as never, range)
    ).rejects.toThrow(`'heartRateVariability' is not a writable health data type`)
    await expect(
      NitroHealth.deleteRecordsByTimeRange('not-a-data-type' as never, range)
    ).rejects.toThrow(`'not-a-data-type' is not a writable health data type`)

    expect(mockNitroHealth.deleteRecordsByIds).not.toHaveBeenCalled()
    expect(mockNitroHealth.deleteRecordsByTimeRange).not.toHaveBeenCalled()
  })

  it('rejects malformed native deletion results', async () => {
    mockNitroHealth.deleteRecordsByIds.mockResolvedValue({
      status: 'completed',
      deletedCountStatus: 'known',
      deletedCount: -1,
    })

    await expect(
      NitroHealth.deleteRecordsByIds('steps', [{ kind: 'record', id: 'record-1' }])
    ).rejects.toThrow('Native deletion result has an invalid deleted count')

    mockNitroHealth.deleteRecordsByTimeRange.mockResolvedValue({
      status: 'notFoundOrNotOwned',
      deletedCountStatus: 'unverifiable',
    })
    await expect(
      NitroHealth.deleteRecordsByTimeRange('steps', {
        startDate: new Date('2026-01-01T00:00:00.000Z'),
        endDate: new Date('2026-01-02T00:00:00.000Z'),
      })
    ).rejects.toThrow('Time-range deletion returned an unsupported native status')

    mockNitroHealth.deleteRecordsByIds.mockResolvedValue({
      status: 'completed',
      deletedCountStatus: 'known',
      deletedCount: 0,
    })
    await expect(
      NitroHealth.deleteRecordsByIds('steps', [{ kind: 'record', id: 'missing-record' }])
    ).rejects.toThrow('No caller-owned health records matched the supplied identities')
  })

  it('propagates native delete rejections', async () => {
    mockNitroHealth.deleteRecordsByIds.mockRejectedValue(
      new Error('Missing permission to write steps')
    )

    await expect(
      NitroHealth.deleteRecordsByIds('steps', [{ kind: 'record', id: 'record-1' }])
    ).rejects.toThrow('Missing permission to write steps')
  })
})
