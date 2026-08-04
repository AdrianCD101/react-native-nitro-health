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
    enableBackgroundDelivery: createMockFunction(() => Promise.resolve(undefined)),
    disableBackgroundDelivery: createMockFunction(() => Promise.resolve(undefined)),
    disableAllBackgroundDelivery: createMockFunction(() => Promise.resolve(undefined)),
    addOnChangeNotificationListener: createMockFunction(() => ({
      remove: createMockFunction(() => undefined),
    })),
    getBackgroundReadAuthorizationStatus: createMockFunction(() => Promise.resolve('unavailable')),
    requestBackgroundReadAuthorization: createMockFunction(() => Promise.resolve('unavailable')),
    createChangesToken: createMockFunction(() => Promise.resolve('mock-changes-token')),
    getChanges: createMockFunction(() =>
      Promise.resolve({
        tokenExpired: false,
        changes: [],
        nextChangesToken: 'mock-changes-token',
        hasMore: false,
      })
    ),
    readActiveEnergyBurned: createMockFunction(() => Promise.resolve({ samples: [] })),
    readSteps: createMockFunction(() => Promise.resolve({ samples: [] })),
    readDistance: createMockFunction(() => Promise.resolve({ samples: [] })),
    readBodyMass: createMockFunction(() => Promise.resolve({ samples: [] })),
    readHeartRate: createMockFunction(() => Promise.resolve({ samples: [] })),
    readHeartRateStatistics: createMockFunction(() => Promise.resolve({})),
    readRestingHeartRate: createMockFunction(() => Promise.resolve({ samples: [] })),
    readHeartRateVariability: createMockFunction(() => Promise.resolve({ samples: [] })),
    readOxygenSaturation: createMockFunction(() => Promise.resolve({ samples: [] })),
    readHeight: createMockFunction(() => Promise.resolve({ samples: [] })),
    readStatistics: createMockFunction(() => Promise.resolve([])),
    readSleepSamples: createMockFunction(() => Promise.resolve({ samples: [] })),
    readWorkouts: createMockFunction(() => Promise.resolve({ samples: [] })),
    saveSteps: createMockFunction(() => Promise.resolve(undefined)),
    saveDistance: createMockFunction(() => Promise.resolve(undefined)),
    saveActiveEnergyBurned: createMockFunction(() => Promise.resolve(undefined)),
    saveHeartRate: createMockFunction(() => Promise.resolve(undefined)),
    saveBodyMass: createMockFunction(() => Promise.resolve(undefined)),
    saveRestingHeartRate: createMockFunction(() => Promise.resolve(undefined)),
    saveOxygenSaturation: createMockFunction(() => Promise.resolve(undefined)),
    saveHeight: createMockFunction(() => Promise.resolve(undefined)),
    saveSleepSessions: createMockFunction(() => Promise.resolve(undefined)),
    deleteSamplesByUuids: createMockFunction(() => Promise.resolve(undefined)),
    deleteSamplesByTimeRange: createMockFunction(() => Promise.resolve(undefined)),
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
