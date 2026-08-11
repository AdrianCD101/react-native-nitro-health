function createMockFunction(implementation) {
  if (typeof jest !== 'undefined' && typeof jest.fn === 'function') {
    return jest.fn(implementation)
  }
  return implementation || (() => undefined)
}

const healthDataTypes = new Set([
  'steps',
  'heartRate',
  'bloodPressure',
  'bloodGlucose',
  'restingHeartRate',
  'heartRateVariability',
  'distance',
  'activeEnergyBurned',
  'oxygenSaturation',
  'height',
  'sleep',
  'bodyMass',
  'workout',
])

function validateDataTypes(values, label) {
  for (const [index, value] of values.entries()) {
    if (!healthDataTypes.has(value)) {
      return new Error(`${label}[${index}]: unsupported health data type '${value}'`)
    }
  }
}

function validatePermissions(permissions) {
  if (!Array.isArray(permissions) || permissions.length === 0) {
    return new Error('At least one health permission is required')
  }
  for (const [index, permission] of permissions.entries()) {
    if (
      typeof permission !== 'object' ||
      permission === null ||
      (permission.accessType !== 'read' && permission.accessType !== 'write') ||
      !healthDataTypes.has(permission.dataType)
    ) {
      return new Error(`permissions[${index}]: a supported read or write permission is required`)
    }
    if (permission.accessType === 'write' && permission.dataType === 'heartRateVariability') {
      return new Error(`permissions[${index}]: heartRateVariability is read-only`)
    }
  }
}

function validateNonEmpty(values, message) {
  return !Array.isArray(values) || values.length === 0 ? new Error(message) : undefined
}

function createProfile(profile) {
  if (profile === 'observer') {
    return {
      availability: { status: 'available' },
      capabilities: {
        backgroundChanges: {
          mode: 'observer',
          frequencies: ['immediate', 'hourly', 'daily', 'weekly'],
          backgroundRead: 'included',
        },
        historyRead: 'included',
      },
    }
  }
  if (profile === 'unavailable') {
    return {
      availability: { status: 'unavailable', reason: 'not-supported' },
      capabilities: {
        backgroundChanges: {
          mode: 'polling',
          scheduling: 'app-owned',
          backgroundRead: 'unsupported',
        },
        historyRead: 'unsupported',
      },
    }
  }
  return {
    availability: { status: 'available' },
    capabilities: {
      backgroundChanges: {
        mode: 'polling',
        scheduling: 'app-owned',
        backgroundRead: 'not-granted',
      },
      historyRead: 'not-granted',
    },
  }
}

function createNitroHealthMock(options = {}) {
  const profileName = options.profile || 'polling'
  const profile = createProfile(profileName)
  let mock
  const currentAvailability = () => mock.getAvailability()
  const unavailableAvailability = () => {
    const availability = currentAvailability()
    return availability.status === 'unavailable' ? availability : undefined
  }
  const rejectWhenUnavailable = (value) => {
    if (unavailableAvailability() !== undefined) {
      return Promise.reject(new Error('Health data is not available'))
    }
    return Promise.resolve(value)
  }
  const getPermissionStatusResult = (permissions) => {
    const validationError = validatePermissions(permissions)
    if (validationError !== undefined) return Promise.reject(validationError)
    const availability = unavailableAvailability()
    const statuses = permissions.map((permission) => ({
      permission,
      status:
        availability !== undefined ||
        (profileName === 'observer' && permission.accessType === 'read')
          ? 'unverifiable'
          : profileName === 'observer'
            ? 'notDetermined'
            : 'notGranted',
    }))
    if (availability !== undefined) {
      return Promise.resolve({ status: 'unavailable', availability, statuses })
    }
    return Promise.resolve({ status: 'available', statuses })
  }
  const saveSamples = (samples, result) => {
    const validationError = validateNonEmpty(samples, 'At least one sample is required')
    return validationError === undefined
      ? rejectWhenUnavailable(result)
      : Promise.reject(validationError)
  }
  mock = {
    getAvailability: createMockFunction(() => profile.availability),
    performAvailabilityRecovery: createMockFunction(() =>
      Promise.resolve({ status: 'unavailable', reason: 'no-recovery-action' })
    ),
    getCapabilities: createMockFunction(() => {
      const availability = unavailableAvailability()
      return Promise.resolve(
        availability === undefined
          ? { status: 'available', ...profile.capabilities }
          : { status: 'unavailable', availability }
      )
    }),
    requestAdditionalAccess: createMockFunction((access) => {
      if (access !== 'background-read' && access !== 'history-read') {
        return Promise.reject(new Error('access must be background-read or history-read'))
      }
      const availability = unavailableAvailability()
      if (availability !== undefined) {
        return Promise.resolve({ access, status: 'unavailable', availability })
      }
      const status =
        access === 'background-read'
          ? profile.capabilities.backgroundChanges.backgroundRead
          : profile.capabilities.historyRead
      return Promise.resolve({ access, status })
    }),
    managePermissions: createMockFunction(() => {
      const availability = unavailableAvailability()
      if (availability !== undefined) {
        return Promise.resolve({ status: 'unavailable', availability })
      }
      if (profileName === 'observer') {
        return Promise.resolve({
          status: 'user-action-required',
          action: { kind: 'manual', destination: 'health-app-permissions' },
        })
      }
      return Promise.resolve({
        status: 'user-action-required',
        action: { kind: 'opened', destination: 'health-connect-settings' },
      })
    }),
    revokeAllPermissions: createMockFunction(() => {
      const availability = unavailableAvailability()
      if (availability !== undefined) {
        return Promise.resolve({ status: 'unavailable', availability })
      }
      if (profileName === 'observer') {
        return Promise.resolve({
          status: 'user-action-required',
          action: { kind: 'manual', destination: 'health-app-permissions' },
        })
      }
      return Promise.resolve({ status: 'completed' })
    }),
    configureBackgroundChanges: createMockFunction((configuration) => {
      if (!Array.isArray(configuration?.dataTypes) || configuration.dataTypes.length === 0) {
        return Promise.reject(new Error('At least one background change data type is required'))
      }
      const validationError = validateDataTypes(configuration.dataTypes, 'configuration.dataTypes')
      if (validationError !== undefined) return Promise.reject(validationError)
      if (unavailableAvailability() !== undefined) return Promise.resolve({ status: 'unavailable' })
      if (profileName === 'observer') {
        return Promise.resolve({ status: 'completed', mode: 'observer' })
      }
      return Promise.resolve({
        status: 'user-action-required',
        mode: 'polling',
        scheduling: 'app-owned',
        backgroundRead: profile.capabilities.backgroundChanges.backgroundRead,
      })
    }),
    disableBackgroundChanges: createMockFunction((dataTypes) => {
      if (Array.isArray(dataTypes) && dataTypes.length === 0) {
        return Promise.reject(
          new Error('dataTypes must be omitted or contain at least one health data type')
        )
      }
      const validationError = dataTypes && validateDataTypes(dataTypes, 'dataTypes')
      if (validationError !== undefined) return Promise.reject(validationError)
      if (unavailableAvailability() !== undefined) return Promise.resolve({ status: 'unavailable' })
      if (profileName === 'observer') {
        return Promise.resolve({ status: 'completed', mode: 'observer' })
      }
      return Promise.resolve({
        status: 'user-action-required',
        mode: 'polling',
        scheduling: 'app-owned',
        backgroundRead: profile.capabilities.backgroundChanges.backgroundRead,
      })
    }),
    subscribeToBackgroundChanges: createMockFunction((listener) => {
      if (typeof listener !== 'function') {
        throw new Error('A background change listener function is required')
      }
      const availability = unavailableAvailability()
      if (availability !== undefined) {
        return { mode: 'unavailable', availability }
      }
      if (profileName !== 'observer') return { mode: 'polling', scheduling: 'app-owned' }
      return {
        mode: 'observer',
        subscription: { remove: createMockFunction(() => undefined) },
      }
    }),
    createChangesToken: createMockFunction(() => rejectWhenUnavailable('mock-changes-token')),
    getChanges: createMockFunction(() =>
      rejectWhenUnavailable({
        tokenExpired: false,
        changes: [],
        nextChangesToken: 'mock-changes-token',
        hasMore: false,
      })
    ),
    readActiveEnergyBurned: createMockFunction(() => rejectWhenUnavailable({ samples: [] })),
    readSteps: createMockFunction(() => rejectWhenUnavailable({ samples: [] })),
    readDistance: createMockFunction(() => rejectWhenUnavailable({ samples: [] })),
    readBodyMass: createMockFunction(() => rejectWhenUnavailable({ samples: [] })),
    readHeartRate: createMockFunction(() => rejectWhenUnavailable({ samples: [] })),
    readBloodPressure: createMockFunction(() => rejectWhenUnavailable({ samples: [] })),
    readBloodGlucose: createMockFunction(() => rejectWhenUnavailable({ samples: [] })),
    readHeartRateStatistics: createMockFunction(() => rejectWhenUnavailable({})),
    readRestingHeartRate: createMockFunction(() => rejectWhenUnavailable({ samples: [] })),
    readHeartRateVariability: createMockFunction(() => rejectWhenUnavailable({ samples: [] })),
    readOxygenSaturation: createMockFunction(() => rejectWhenUnavailable({ samples: [] })),
    readHeight: createMockFunction(() => rejectWhenUnavailable({ samples: [] })),
    readStatistics: createMockFunction(() => rejectWhenUnavailable([])),
    readSleepSamples: createMockFunction(() => rejectWhenUnavailable({ samples: [] })),
    readWorkouts: createMockFunction(() => rejectWhenUnavailable({ samples: [] })),
    saveSteps: createMockFunction((samples) => saveSamples(samples, undefined)),
    saveDistance: createMockFunction((samples) =>
      saveSamples(samples, {
        status: 'completed',
        storedScope: profileName === 'observer' ? 'walking-running' : 'activity-unspecified',
      })
    ),
    saveActiveEnergyBurned: createMockFunction((samples) => saveSamples(samples, undefined)),
    saveHeartRate: createMockFunction((samples) => saveSamples(samples, undefined)),
    saveBloodPressure: createMockFunction((samples) => saveSamples(samples, undefined)),
    saveBloodGlucose: createMockFunction((samples) => saveSamples(samples, undefined)),
    saveBodyMass: createMockFunction((samples) => saveSamples(samples, undefined)),
    saveRestingHeartRate: createMockFunction((samples) => saveSamples(samples, undefined)),
    saveOxygenSaturation: createMockFunction((samples) => saveSamples(samples, undefined)),
    saveHeight: createMockFunction((samples) => saveSamples(samples, undefined)),
    saveSleepSessions: createMockFunction((sessions) => {
      const validationError = validateNonEmpty(sessions, 'At least one sleep session is required')
      return validationError === undefined
        ? rejectWhenUnavailable(undefined)
        : Promise.reject(validationError)
    }),
    saveWorkout: createMockFunction(() => rejectWhenUnavailable(undefined)),
    deleteRecordsByIds: createMockFunction((_dataType, records) => {
      if (records.length === 0) {
        return Promise.reject(new Error('At least one record identity is required'))
      }
      return rejectWhenUnavailable({
        status: 'completed',
        requestedCount: records.length,
        deletedCount: { status: 'known', value: records.length },
      })
    }),
    deleteRecordsByTimeRange: createMockFunction(() =>
      rejectWhenUnavailable({ status: 'completed', deletedCount: { status: 'unverifiable' } })
    ),
    getPermissionStatuses: createMockFunction(getPermissionStatusResult),
    requestAuthorization: createMockFunction(async (permissions) => {
      const result = await getPermissionStatusResult(permissions)
      if (result.status === 'unavailable') return result
      return { status: 'completed', statuses: result.statuses }
    }),
  }

  return Object.assign(mock, options.overrides || {})
}

const NitroHealth = createNitroHealthMock()

function resetNitroHealthMock(options = {}) {
  return Object.assign(NitroHealth, createNitroHealthMock(options))
}

module.exports = {
  NitroHealth,
  createNitroHealthMock,
  resetNitroHealthMock,
}
