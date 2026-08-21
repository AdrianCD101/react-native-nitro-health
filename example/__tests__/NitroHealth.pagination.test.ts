import { mockNitroHealth, nativeRecordMetadata } from './support/mockNitroHealth'

jest.mock('react-native-nitro-modules', () => ({
  NitroModules: {
    createHybridObject: jest.fn(() => mockNitroHealth),
  },
}))

import { NitroHealth } from 'react-native-nitro-health'

describe('NitroHealth pagination contract', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('cursor forwarding', () => {
    it('forwards the cursor to native verbatim when provided', async () => {
      const startDate = new Date('2026-01-01T00:00:00.000Z')
      const endDate = new Date('2026-01-08T00:00:00.000Z')
      mockNitroHealth.readSteps.mockResolvedValue({ samples: [] })

      await NitroHealth.readSteps({ startDate, endDate, cursor: 'opaque-cursor-1' })

      expect(mockNitroHealth.readSteps).toHaveBeenCalledWith({
        startTimeMs: startDate.getTime(),
        endTimeMs: endDate.getTime(),
        limit: 1000,
        ascending: true,
        cursor: 'opaque-cursor-1',
        originIdentifiers: [],
      })
    })

    it('sends a native query without a cursor key when the caller omits it', async () => {
      const startDate = new Date('2026-01-01T00:00:00.000Z')
      const endDate = new Date('2026-01-08T00:00:00.000Z')
      mockNitroHealth.readSteps.mockResolvedValue({ samples: [] })

      await NitroHealth.readSteps({ startDate, endDate })

      expect(mockNitroHealth.readSteps).toHaveBeenCalledWith({
        startTimeMs: startDate.getTime(),
        endTimeMs: endDate.getTime(),
        limit: 1000,
        ascending: true,
        originIdentifiers: [],
      })
      expect(mockNitroHealth.readSteps.mock.calls[0][0]).not.toHaveProperty('cursor')
    })
  })

  describe('nextCursor mapping', () => {
    it('surfaces the native nextCursor on the public result', async () => {
      const startDate = new Date('2026-01-01T00:00:00.000Z')
      const endDate = new Date('2026-01-08T00:00:00.000Z')
      mockNitroHealth.readSteps.mockResolvedValue({
        samples: [
          {
            ...nativeRecordMetadata('record-1'),
            startTimeMs: startDate.getTime(),
            endTimeMs: endDate.getTime(),
            count: 123,
          },
        ],
        nextCursor: 'opaque-cursor-2',
      })

      const result = await NitroHealth.readSteps({ startDate, endDate })

      expect(result.nextCursor).toBe('opaque-cursor-2')
      expect(result.samples).toHaveLength(1)
    })

    it('omits nextCursor when the native side omits it', async () => {
      const startDate = new Date('2026-01-01T00:00:00.000Z')
      const endDate = new Date('2026-01-08T00:00:00.000Z')
      mockNitroHealth.readSteps.mockResolvedValue({ samples: [] })

      const result = await NitroHealth.readSteps({ startDate, endDate })

      expect(result).not.toHaveProperty('nextCursor')
    })
  })

  describe('sample metadata mapping', () => {
    it('maps native identity, origin, and device provenance onto public samples', async () => {
      const startDate = new Date('2026-01-01T00:00:00.000Z')
      const endDate = new Date('2026-01-08T00:00:00.000Z')
      mockNitroHealth.readSteps.mockResolvedValue({
        samples: [
          {
            ...nativeRecordMetadata('record-1', 'com.example.health', 'Example Health', 'unknown', {
              type: 'headMounted',
              manufacturer: 'Example Devices',
              model: 'Vision 2',
            }),
            startTimeMs: startDate.getTime(),
            endTimeMs: endDate.getTime(),
            count: 123,
          },
        ],
      })

      const result = await NitroHealth.readSteps({ startDate, endDate })

      expect(result.samples[0].identity).toEqual({ kind: 'record', id: 'record-1' })
      expect(result.samples[0].origin).toEqual({
        identifier: 'com.example.health',
        displayName: 'Example Health',
      })
      expect(result.samples[0].device).toEqual({
        type: 'head-mounted',
        manufacturer: 'Example Devices',
        model: 'Vision 2',
      })
    })

    it('omits device when the native sample has no device provenance', async () => {
      const startDate = new Date('2026-01-01T00:00:00.000Z')
      const endDate = new Date('2026-01-08T00:00:00.000Z')
      mockNitroHealth.readSteps.mockResolvedValue({
        samples: [
          {
            ...nativeRecordMetadata('record-2'),
            startTimeMs: startDate.getTime(),
            endTimeMs: endDate.getTime(),
            count: 456,
          },
        ],
      })

      const result = await NitroHealth.readSteps({ startDate, endDate })

      expect(result.samples[0]).not.toHaveProperty('device')
    })

    it('omits a native device containing only blank projected fields', async () => {
      const startDate = new Date('2026-01-01T00:00:00.000Z')
      const endDate = new Date('2026-01-08T00:00:00.000Z')
      mockNitroHealth.readSteps.mockResolvedValue({
        samples: [
          {
            ...nativeRecordMetadata('record-3', 'com.example.health', undefined, 'unknown', {
              manufacturer: ' ',
              model: '',
            }),
            startTimeMs: startDate.getTime(),
            endTimeMs: endDate.getTime(),
            count: 789,
          },
        ],
      })

      const result = await NitroHealth.readSteps({ startDate, endDate })

      expect(result.samples[0]).not.toHaveProperty('device')
    })
  })

  describe('cursor validation', () => {
    it('rejects an empty-string cursor without crossing the bridge', async () => {
      const startDate = new Date('2026-01-01T00:00:00.000Z')
      const endDate = new Date('2026-01-08T00:00:00.000Z')

      await expect(NitroHealth.readSteps({ startDate, endDate, cursor: '' })).rejects.toThrow(
        'cursor must be a non-empty string'
      )
      expect(mockNitroHealth.readSteps).not.toHaveBeenCalled()
    })

    it('rejects a non-string cursor without crossing the bridge', async () => {
      const startDate = new Date('2026-01-01T00:00:00.000Z')
      const endDate = new Date('2026-01-08T00:00:00.000Z')

      await expect(
        NitroHealth.readSteps({ startDate, endDate, cursor: 123 as any })
      ).rejects.toThrow('cursor must be a non-empty string')
      expect(mockNitroHealth.readSteps).not.toHaveBeenCalled()
    })
  })
})
