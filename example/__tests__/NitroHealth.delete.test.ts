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

  it('deletes samples by uuid through the Nitro hybrid object', async () => {
    mockNitroHealth.deleteSamplesByUuids.mockResolvedValue(undefined)

    await expect(
      NitroHealth.deleteSamplesByUuids('steps', ['uuid-1', 'uuid-2'])
    ).resolves.toBeUndefined()

    expect(mockNitroHealth.deleteSamplesByUuids).toHaveBeenCalledWith('steps', ['uuid-1', 'uuid-2'])
  })

  it('deletes samples by time range through the Nitro hybrid object', async () => {
    const startDate = new Date('2026-01-01T09:00:00.000Z')
    const endDate = new Date('2026-01-01T09:30:00.000Z')
    mockNitroHealth.deleteSamplesByTimeRange.mockResolvedValue(undefined)

    await expect(
      NitroHealth.deleteSamplesByTimeRange('heartRate', { startDate, endDate })
    ).resolves.toBeUndefined()

    expect(mockNitroHealth.deleteSamplesByTimeRange).toHaveBeenCalledWith('heartRate', {
      startTimeMs: startDate.getTime(),
      endTimeMs: endDate.getTime(),
    })
  })

  it('rejects empty uuid arrays before crossing the native boundary', async () => {
    await expect(NitroHealth.deleteSamplesByUuids('steps', [])).rejects.toThrow(
      'At least one uuid is required'
    )

    expect(mockNitroHealth.deleteSamplesByUuids).not.toHaveBeenCalled()
  })

  it('rejects blank uuids before crossing the native boundary', async () => {
    await expect(NitroHealth.deleteSamplesByUuids('steps', [''])).rejects.toThrow(
      'uuids[0]: a non-empty uuid string is required'
    )

    expect(mockNitroHealth.deleteSamplesByUuids).not.toHaveBeenCalled()
  })

  it('rejects synthetic reading ids before crossing the native boundary', async () => {
    await expect(NitroHealth.deleteSamplesByUuids('heartRate', ['abc#0'])).rejects.toThrow(
      "uuids[0]: synthetic reading ids (record id + '#index') cannot be deleted individually; use deleteSamplesByTimeRange instead"
    )

    expect(mockNitroHealth.deleteSamplesByUuids).not.toHaveBeenCalled()
  })

  it('reports the failing uuid index for synthetic reading ids', async () => {
    await expect(
      NitroHealth.deleteSamplesByUuids('sleep', ['real-record-id', 'abc#3'])
    ).rejects.toThrow(
      "uuids[1]: synthetic reading ids (record id + '#index') cannot be deleted individually; use deleteSamplesByTimeRange instead"
    )

    expect(mockNitroHealth.deleteSamplesByUuids).not.toHaveBeenCalled()
  })

  it('rejects invalid time ranges before crossing the native boundary', async () => {
    const endDate = new Date('2026-01-01T09:30:00.000Z')

    await expect(
      NitroHealth.deleteSamplesByTimeRange('steps', { startDate: new Date(Number.NaN), endDate })
    ).rejects.toThrow('A valid startDate is required')
    await expect(
      NitroHealth.deleteSamplesByTimeRange('steps', { startDate: endDate, endDate })
    ).rejects.toThrow('startDate must be before endDate')

    expect(mockNitroHealth.deleteSamplesByTimeRange).not.toHaveBeenCalled()
  })

  it('propagates native delete rejections', async () => {
    mockNitroHealth.deleteSamplesByUuids.mockRejectedValue(
      new Error('Missing permission to write steps')
    )

    await expect(NitroHealth.deleteSamplesByUuids('steps', ['uuid-1'])).rejects.toThrow(
      'Missing permission to write steps'
    )
  })
})
