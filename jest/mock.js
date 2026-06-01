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
    readSteps: createMockFunction(() => Promise.resolve([])),
    readHeartRate: createMockFunction(() => Promise.resolve([])),
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
