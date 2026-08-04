import type { HealthAvailabilityStatus } from 'react-native-nitro-health'

import { NitroHealth, createNitroHealthMock, resetNitroHealthMock } from '../../jest/mock'

describe('NitroHealth Jest mock', () => {
  beforeEach(() => {
    resetNitroHealthMock()
  })

  it('provides default mocked health methods', async () => {
    const range = {
      startDate: new Date('2026-01-01T00:00:00.000Z'),
      endDate: new Date('2026-01-02T00:00:00.000Z'),
    }

    expect(NitroHealth.isAvailable()).toBe(true)
    expect(NitroHealth.getAvailabilityStatus()).toBe('available')
    await expect(NitroHealth.openHealthSettings()).resolves.toBe(true)
    await expect(NitroHealth.enableBackgroundDelivery('steps', 'hourly')).resolves.toBeUndefined()
    await expect(NitroHealth.disableBackgroundDelivery('steps')).resolves.toBeUndefined()
    await expect(NitroHealth.disableAllBackgroundDelivery()).resolves.toBeUndefined()
    await expect(NitroHealth.getBackgroundReadAuthorizationStatus()).resolves.toBe('unavailable')
    await expect(NitroHealth.requestBackgroundReadAuthorization()).resolves.toBe('unavailable')
    const subscription = NitroHealth.addOnChangeNotificationListener(() => undefined)
    expect(subscription.remove).toEqual(expect.any(Function))
    subscription.remove()
    await expect(NitroHealth.createChangesToken('steps')).resolves.toBe('mock-changes-token')
    await expect(NitroHealth.getChanges('steps', 'mock-changes-token')).resolves.toEqual({
      tokenExpired: false,
      changes: [],
      nextChangesToken: 'mock-changes-token',
      hasMore: false,
    })
    await expect(NitroHealth.readActiveEnergyBurned(range)).resolves.toEqual({ samples: [] })
    await expect(NitroHealth.readSteps(range)).resolves.toEqual({ samples: [] })
    await expect(NitroHealth.readDistance(range)).resolves.toEqual({ samples: [] })
    await expect(NitroHealth.readBodyMass(range)).resolves.toEqual({ samples: [] })
    await expect(NitroHealth.readHeartRate(range)).resolves.toEqual({ samples: [] })
    await expect(NitroHealth.readHeartRateStatistics(range)).resolves.toEqual({})
    await expect(
      NitroHealth.readStatistics('steps', { ...range, bucket: 'day', metrics: ['sum'] })
    ).resolves.toEqual([])
    await expect(NitroHealth.readRestingHeartRate(range)).resolves.toEqual({ samples: [] })
    await expect(NitroHealth.readHeartRateVariability(range)).resolves.toEqual({ samples: [] })
    await expect(NitroHealth.readOxygenSaturation(range)).resolves.toEqual({ samples: [] })
    await expect(NitroHealth.readHeight(range)).resolves.toEqual({ samples: [] })
    await expect(NitroHealth.readSleepSamples(range)).resolves.toEqual({ samples: [] })
    await expect(NitroHealth.readWorkouts(range)).resolves.toEqual({ samples: [] })
    await expect(
      NitroHealth.saveSteps([
        {
          ...range,
          count: 100,
          sync: { id: 'mock-step-record', version: 0 },
        },
      ])
    ).resolves.toBeUndefined()
    expect(NitroHealth.saveSteps).toHaveBeenCalledWith([
      {
        ...range,
        count: 100,
        sync: { id: 'mock-step-record', version: 0 },
      },
    ])
    await expect(
      NitroHealth.saveSleepSessions([{ ...range, timeZone: 'UTC' }])
    ).resolves.toBeUndefined()
    await expect(NitroHealth.getRequestStatusForAuthorization([])).resolves.toBe('unknown')
  })

  it('allows consumers to override default behavior', () => {
    resetNitroHealthMock({
      isAvailable: jest.fn(() => false),
      getAvailabilityStatus: jest.fn((): HealthAvailabilityStatus => 'unavailable'),
    })

    expect(NitroHealth.isAvailable()).toBe(false)
    expect(NitroHealth.getAvailabilityStatus()).toBe('unavailable')
  })

  it('creates isolated mock instances', () => {
    const mock = createNitroHealthMock({
      getAvailabilityStatus: jest.fn((): HealthAvailabilityStatus => 'providerUpdateRequired'),
    })

    expect(mock.getAvailabilityStatus()).toBe('providerUpdateRequired')
    expect(NitroHealth.getAvailabilityStatus()).toBe('available')
  })
})
