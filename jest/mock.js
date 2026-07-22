function createMockFunction(implementation) {
  if (typeof jest !== 'undefined' && typeof jest.fn === 'function') {
    return jest.fn(implementation)
  }

  return implementation || (() => undefined)
}

function createNitroHealthMock(overrides = {}) {
  const mock = {
    name: 'NitroHealth',
    toString: createMockFunction(() => '[object NitroHealth]'),
    equals: createMockFunction((other) => other === mock),
    dispose: createMockFunction(() => undefined),
    isAvailable: createMockFunction(() => true),
    getAvailabilityStatus: createMockFunction(() => 'available'),
    openHealthConnectInstall: createMockFunction(() => false),
    openHealthSettings: createMockFunction(() => Promise.resolve(true)),
    readActiveEnergyBurned: createMockFunction(() => Promise.resolve([])),
    readDailyActiveEnergyBurnedTotals: createMockFunction(() => Promise.resolve([])),
    readDailyDistanceTotals: createMockFunction(() => Promise.resolve([])),
    readSteps: createMockFunction(() => Promise.resolve([])),
    readDailyStepTotals: createMockFunction(() => Promise.resolve([])),
    readDistance: createMockFunction(() => Promise.resolve([])),
    readBodyMass: createMockFunction(() => Promise.resolve([])),
    readHeartRate: createMockFunction(() => Promise.resolve([])),
    readHeartRateStatistics: createMockFunction(() => Promise.resolve({})),
    readRestingHeartRate: createMockFunction(() => Promise.resolve([])),
    readHeartRateVariability: createMockFunction(() => Promise.resolve([])),
    readOxygenSaturation: createMockFunction(() => Promise.resolve([])),
    readHeight: createMockFunction(() => Promise.resolve([])),
    readStatistics: createMockFunction(() => Promise.resolve([])),
    readSleepSamples: createMockFunction(() => Promise.resolve([])),
    saveSteps: createMockFunction(() => Promise.resolve(undefined)),
    saveDistance: createMockFunction(() => Promise.resolve(undefined)),
    saveActiveEnergyBurned: createMockFunction(() => Promise.resolve(undefined)),
    saveHeartRate: createMockFunction(() => Promise.resolve(undefined)),
    saveBodyMass: createMockFunction(() => Promise.resolve(undefined)),
    saveRestingHeartRate: createMockFunction(() => Promise.resolve(undefined)),
    saveOxygenSaturation: createMockFunction(() => Promise.resolve(undefined)),
    saveHeight: createMockFunction(() => Promise.resolve(undefined)),
    getRequestStatusForAuthorization: createMockFunction(() => Promise.resolve('unknown')),
    requestAuthorization: createMockFunction(() =>
      Promise.resolve({
        status: 'completed',
        availabilityStatus: 'available',
        requestStatus: 'unknown',
        grantedPermissions: [],
        deniedPermissions: [],
        unverifiablePermissions: [],
      })
    ),
  }

  return Object.assign(mock, overrides)
}

const NitroHealth = createNitroHealthMock()

function resetNitroHealthMock(overrides = {}) {
  return Object.assign(NitroHealth, createNitroHealthMock(overrides))
}

module.exports = {
  NitroHealth,
  createNitroHealthMock,
  resetNitroHealthMock,
}
