import { mockNitroHealth } from './support/mockNitroHealth'

jest.mock('react-native-nitro-modules', () => ({
  NitroModules: {
    createHybridObject: jest.fn(() => mockNitroHealth),
  },
}))

import { NitroHealth } from 'react-native-nitro-health'

const startDate = new Date('2026-01-01T00:00:00.000Z')
const endDate = new Date('2026-01-08T00:00:00.000Z')

describe('NitroHealth origins contract', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('query mapping', () => {
    it("maps 'own-app' to ownAppOnly with the empty no-filter identifier list", async () => {
      mockNitroHealth.readSteps.mockResolvedValue({ samples: [] })

      await NitroHealth.readSteps({ startDate, endDate, origins: 'own-app' })

      expect(mockNitroHealth.readSteps).toHaveBeenCalledWith({
        startTimeMs: startDate.getTime(),
        endTimeMs: endDate.getTime(),
        limit: 1000,
        ascending: true,
        ownAppOnly: true,
        originIdentifiers: [],
      })
    })

    it('canonicalizes identifier lists: deduped and sorted, without an ownAppOnly key', async () => {
      mockNitroHealth.readSteps.mockResolvedValue({ samples: [] })

      await NitroHealth.readSteps({
        startDate,
        endDate,
        origins: ['com.b.app', 'com.a.app', 'com.a.app'],
      })

      expect(mockNitroHealth.readSteps).toHaveBeenCalledWith({
        startTimeMs: startDate.getTime(),
        endTimeMs: endDate.getTime(),
        limit: 1000,
        ascending: true,
        originIdentifiers: ['com.a.app', 'com.b.app'],
      })
      expect(mockNitroHealth.readSteps.mock.calls[0]?.[0]).not.toHaveProperty('ownAppOnly')
    })

    it('sends the empty no-filter identifier list and no ownAppOnly key when origins is omitted', async () => {
      mockNitroHealth.readSteps.mockResolvedValue({ samples: [] })

      await NitroHealth.readSteps({ startDate, endDate })

      const nativeQuery = mockNitroHealth.readSteps.mock.calls[0]?.[0]
      expect(nativeQuery).not.toHaveProperty('ownAppOnly')
      expect(nativeQuery?.originIdentifiers).toEqual([])
    })
  })

  describe('validation', () => {
    it('rejects an empty identifier array', async () => {
      await expect(NitroHealth.readSteps({ startDate, endDate, origins: [] })).rejects.toThrow(
        'origins must contain at least one identifier'
      )
      expect(mockNitroHealth.readSteps).not.toHaveBeenCalled()
    })

    it('rejects blank identifiers', async () => {
      await expect(NitroHealth.readSteps({ startDate, endDate, origins: ['  '] })).rejects.toThrow(
        'origins identifiers must be non-empty strings'
      )
      expect(mockNitroHealth.readSteps).not.toHaveBeenCalled()
    })

    it('rejects non-string identifiers', async () => {
      // Simulates untrusted runtime input reaching the wrapper (e.g. from parsed JSON).
      const nonStringIdentifiers: unknown = [42]
      await expect(
        NitroHealth.readSteps({
          startDate,
          endDate,
          origins: nonStringIdentifiers as string[],
        })
      ).rejects.toThrow('origins identifiers must be non-empty strings')
      expect(mockNitroHealth.readSteps).not.toHaveBeenCalled()
    })

    it('rejects values that are neither own-app nor an array', async () => {
      // A bare identifier string is a likely caller mistake for the 'own-app' literal.
      const bareIdentifier: unknown = 'com.a.app'
      await expect(
        NitroHealth.readSteps({
          startDate,
          endDate,
          origins: bareIdentifier as 'own-app',
        })
      ).rejects.toThrow("origins must be 'own-app' or an array of origin identifiers")
      expect(mockNitroHealth.readSteps).not.toHaveBeenCalled()
    })
  })

  describe('ownOrigin', () => {
    it('surfaces the native ownOrigin', () => {
      expect(NitroHealth.ownOrigin).toEqual({
        identifier: 'com.nitrohealth.mock',
        displayName: 'Nitro Health Mock',
      })
    })
  })
})
