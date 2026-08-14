import { mockNitroHealth, nativeRecordMetadata } from './support/mockNitroHealth'

jest.mock('react-native-nitro-modules', () => ({
  NitroModules: {
    createHybridObject: jest.fn(() => mockNitroHealth),
  },
}))

import { NitroHealth } from 'react-native-nitro-health'

describe('NitroHealth hydration contract', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('maps native hydration intervals to public samples', async () => {
    const startDate = new Date('2026-01-01T09:00:00.000Z')
    const endDate = new Date('2026-01-01T09:30:00.000Z')
    mockNitroHealth.readHydration.mockResolvedValue({
      samples: [
        {
          ...nativeRecordMetadata('hydration-1'),
          startTimeMs: startDate.getTime(),
          endTimeMs: endDate.getTime(),
          milliliters: 250.5,
        },
      ],
      nextCursor: 'hydration-cursor',
    })

    await expect(NitroHealth.readHydration({ startDate, endDate })).resolves.toEqual({
      samples: [
        {
          identity: { kind: 'record', id: 'hydration-1' },
          origin: { identifier: 'com.example.health' },
          recordingMethod: 'unknown',
          startDate,
          endDate,
          milliliters: 250.5,
        },
      ],
      nextCursor: 'hydration-cursor',
    })
  })

  it('rejects invalid hydration values before crossing the native boundary', async () => {
    const startDate = new Date('2026-01-01T09:00:00.000Z')
    const endDate = new Date('2026-01-01T09:30:00.000Z')

    await expect(
      NitroHealth.saveHydration([{ startDate, endDate, milliliters: -1 }])
    ).rejects.toThrow('samples[0]: milliliters must be a non-negative number')
    await expect(
      NitroHealth.saveHydration([{ startDate, endDate, milliliters: 100_001 }])
    ).rejects.toThrow('samples[0]: milliliters must not exceed 100000')
    expect(mockNitroHealth.saveHydration).not.toHaveBeenCalled()
  })

  it('allows only sum statistics for hydration', async () => {
    const startDate = new Date('2026-01-01T00:00:00.000Z')
    const endDate = new Date('2026-01-02T00:00:00.000Z')
    mockNitroHealth.readStatistics.mockResolvedValue([])

    await expect(
      NitroHealth.readStatistics('hydration', {
        startDate,
        endDate,
        bucket: 'day',
        metrics: ['sum'],
      })
    ).resolves.toEqual([])
    await expect(
      NitroHealth.readStatistics('hydration', {
        startDate,
        endDate,
        bucket: 'day',
        metrics: ['avg'],
      })
    ).rejects.toThrow("Metric 'avg' is not supported for 'hydration' (supported: sum)")
  })
})
