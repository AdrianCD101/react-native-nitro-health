const { NitroHealth, createNitroHealthMock, resetNitroHealthMock } = require('../../jest/mock')

describe('NitroHealth Jest mock', () => {
  beforeEach(() => {
    resetNitroHealthMock()
  })

  it('provides default mocked health methods', async () => {
    expect(NitroHealth.isAvailable()).toBe(true)
    expect(NitroHealth.getAvailabilityStatus()).toBe('available')
    await expect(NitroHealth.openHealthSettings()).resolves.toBe(true)
    await expect(NitroHealth.readSteps({})).resolves.toEqual([])
    await expect(NitroHealth.readDailyStepTotals({})).resolves.toEqual([])
    await expect(NitroHealth.readHeartRate({})).resolves.toEqual([])
    await expect(NitroHealth.readHeartRateStatistics({})).resolves.toEqual({})
    await expect(NitroHealth.getRequestStatusForAuthorization([])).resolves.toBe('unknown')
  })

  it('allows consumers to override default behavior', () => {
    resetNitroHealthMock({
      isAvailable: jest.fn(() => false),
      getAvailabilityStatus: jest.fn(() => 'unavailable'),
    })

    expect(NitroHealth.isAvailable()).toBe(false)
    expect(NitroHealth.getAvailabilityStatus()).toBe('unavailable')
  })

  it('creates isolated mock instances', () => {
    const mock = createNitroHealthMock({
      getAvailabilityStatus: jest.fn(() => 'providerUpdateRequired'),
    })

    expect(mock.getAvailabilityStatus()).toBe('providerUpdateRequired')
    expect(NitroHealth.getAvailabilityStatus()).toBe('available')
  })
})
