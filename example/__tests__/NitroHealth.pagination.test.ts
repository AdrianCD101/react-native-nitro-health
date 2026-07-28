import { mockNitroHealth } from './support/mockNitroHealth'

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
            uuid: 'uuid-1',
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

    it('leaves nextCursor undefined when the native side omits it', async () => {
      const startDate = new Date('2026-01-01T00:00:00.000Z')
      const endDate = new Date('2026-01-08T00:00:00.000Z')
      mockNitroHealth.readSteps.mockResolvedValue({ samples: [] })

      const result = await NitroHealth.readSteps({ startDate, endDate })

      expect(result.nextCursor).toBeUndefined()
    })
  })

  describe('uuid mapping', () => {
    it('maps the native uuid through onto public samples', async () => {
      const startDate = new Date('2026-01-01T00:00:00.000Z')
      const endDate = new Date('2026-01-08T00:00:00.000Z')
      mockNitroHealth.readSteps.mockResolvedValue({
        samples: [
          {
            uuid: 'uuid-1',
            startTimeMs: startDate.getTime(),
            endTimeMs: endDate.getTime(),
            count: 123,
          },
        ],
      })

      const result = await NitroHealth.readSteps({ startDate, endDate })

      expect(result.samples[0].uuid).toBe('uuid-1')
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
