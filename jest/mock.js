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
  'bodyTemperature',
  'respiratoryRate',
  'bodyFat',
  'leanBodyMass',
  'basalBodyTemperature',
  'restingHeartRate',
  'heartRateVariability',
  'distance',
  'activeEnergyBurned',
  'hydration',
  'floorsClimbed',
  'oxygenSaturation',
  'height',
  'vo2Max',
  'sleep',
  'bodyMass',
  'workout',
  'nutrition',
])

const aggregateOnlyDataTypes = new Set(['basalEnergyBurned', 'totalEnergyBurned'])
const changeTrackingUnsupportedDataTypes = new Set(['nutrition'])

function validateDataTypes(values, label) {
  for (const [index, value] of values.entries()) {
    if (!healthDataTypes.has(value)) {
      return new Error(`${label}[${index}]: unsupported health data type '${value}'`)
    }
    if (changeTrackingUnsupportedDataTypes.has(value)) {
      return new Error(`${label}[${index}]: change tracking is not supported for '${value}' yet`)
    }
  }
}

function validateChangeTrackedDataType(dataType) {
  if (changeTrackingUnsupportedDataTypes.has(dataType)) {
    return new Error(`Change tracking is not supported for '${dataType}' yet`)
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
      (!healthDataTypes.has(permission.dataType) &&
        !aggregateOnlyDataTypes.has(permission.dataType))
    ) {
      return new Error(`permissions[${index}]: a supported read or write permission is required`)
    }
    if (permission.accessType === 'write' && permission.dataType === 'heartRateVariability') {
      return new Error(`permissions[${index}]: heartRateVariability is read-only`)
    }
    if (permission.accessType === 'write' && aggregateOnlyDataTypes.has(permission.dataType)) {
      return new Error(
        `permissions[${index}]: ${permission.dataType} is an aggregate-only read type`
      )
    }
  }
}

function validateNonEmpty(values, message) {
  return !Array.isArray(values) || values.length === 0 ? new Error(message) : undefined
}

const writableDataTypes = [
  'steps',
  'distance',
  'activeEnergyBurned',
  'hydration',
  'floorsClimbed',
  'bodyMass',
  'heartRate',
  'bloodPressure',
  'bloodGlucose',
  'bodyTemperature',
  'respiratoryRate',
  'bodyFat',
  'leanBodyMass',
  'basalBodyTemperature',
  'restingHeartRate',
  'oxygenSaturation',
  'height',
  'vo2Max',
  'sleep',
  'workout',
  'nutrition',
]

const mockOrigin = {
  identifier: 'react-native-nitro-health.mock',
  displayName: 'Nitro Health Jest Mock',
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
  const storedSamples = Object.fromEntries(writableDataTypes.map((dataType) => [dataType, []]))
  const identityCounters = Object.fromEntries(writableDataTypes.map((dataType) => [dataType, 0]))
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
  const storedRecordingMethod = (recordingMethod) => {
    if (profileName === 'observer') {
      return recordingMethod === 'manual' ? 'manual' : 'unknown'
    }
    return recordingMethod || 'unknown'
  }
  const storedDeviceForInput = (device, recordingMethod) => {
    if (device === undefined || Object.keys(device).length === 0) {
      return profileName === 'polling' &&
        (recordingMethod === 'actively-recorded' || recordingMethod === 'automatically-recorded')
        ? { type: 'unknown' }
        : undefined
    }
    if (profileName !== 'observer') {
      return { ...device, type: device.type || 'unknown' }
    }

    const projected = {}
    if (device.manufacturer !== undefined) projected.manufacturer = device.manufacturer
    if (device.model !== undefined) projected.model = device.model
    return Object.keys(projected).length === 0 ? undefined : projected
  }
  const nextIdentity = (dataType) => {
    identityCounters[dataType] += 1
    const recordId = `mock-${dataType}-${identityCounters[dataType]}`
    if (profileName === 'polling' && dataType === 'heartRate') {
      return {
        kind: 'record-child',
        id: `${recordId}#0`,
        record: { kind: 'record', id: recordId },
      }
    }
    return { kind: 'record', id: recordId }
  }
  const makeStoredSample = (dataType, recordingMethod, device, fields) => {
    const storedSample = {
      identity: nextIdentity(dataType),
      origin: { ...mockOrigin },
      recordingMethod,
      ...fields,
    }
    if (device !== undefined) storedSample.device = device
    return storedSample
  }
  const defaultStoredFields = (sample) => {
    const fields = { ...sample }
    delete fields.device
    delete fields.recordingMethod
    delete fields.sync
    return fields
  }
  const saveSamples = (dataType, samples, makeFields = defaultStoredFields, extraResult = {}) => {
    const validationError = validateNonEmpty(samples, 'At least one sample is required')
    if (validationError !== undefined) return Promise.reject(validationError)
    if (unavailableAvailability() !== undefined) {
      return Promise.reject(new Error('Health data is not available'))
    }

    const storedRecordingMethods = samples.map((sample) =>
      storedRecordingMethod(sample.recordingMethod)
    )
    const publicSamples = samples.map((sample, index) =>
      makeStoredSample(
        dataType,
        storedRecordingMethods[index],
        storedDeviceForInput(sample.device, storedRecordingMethods[index]),
        makeFields(sample, storedRecordingMethods[index])
      )
    )
    storedSamples[dataType].push(...publicSamples)
    return Promise.resolve({ status: 'completed', storedRecordingMethods, ...extraResult })
  }
  const sampleBounds = (sample) => {
    if (sample.date instanceof Date) {
      const time = sample.date.getTime()
      return { start: time, end: time, instant: true }
    }
    const start = sample.startDate instanceof Date ? sample.startDate.getTime() : undefined
    const end = sample.endDate instanceof Date ? sample.endDate.getTime() : start
    return { start, end, instant: start === end }
  }
  const makeSamplePage = (dataType, query = {}) => {
    const queryStart = query.startDate instanceof Date ? query.startDate.getTime() : -Infinity
    const queryEnd = query.endDate instanceof Date ? query.endDate.getTime() : Infinity
    const ascending = query.ascending !== false
    const filtered = storedSamples[dataType]
      .filter((sample) => {
        const { start, end, instant } = sampleBounds(sample)
        if (start === undefined || end === undefined) return true
        return instant
          ? start >= queryStart && start < queryEnd
          : end > queryStart && start < queryEnd
      })
      .sort((left, right) => {
        const leftStart = sampleBounds(left).start || 0
        const rightStart = sampleBounds(right).start || 0
        return ascending ? leftStart - rightStart : rightStart - leftStart
      })
    const cursorMatch =
      typeof query.cursor === 'string' ? /^mock:(\d+)$/.exec(query.cursor) : undefined
    const offset = cursorMatch === null || cursorMatch === undefined ? 0 : Number(cursorMatch[1])
    const limit = Number.isInteger(query.limit) && query.limit > 0 ? query.limit : filtered.length
    const samples = filtered.slice(offset, offset + limit)
    const nextOffset = offset + samples.length

    return nextOffset < filtered.length
      ? { samples, nextCursor: `mock:${nextOffset}` }
      : { samples }
  }
  const readSamples = (dataType, query) => rejectWhenUnavailable(makeSamplePage(dataType, query))
  const makeBodyMassFields = (sample) => {
    const { date, kilograms } = sample
    return { startDate: date, endDate: date, kilograms }
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
    createChangesToken: createMockFunction((dataType) => {
      const validationError = validateChangeTrackedDataType(dataType)
      if (validationError !== undefined) return Promise.reject(validationError)
      return rejectWhenUnavailable('mock-changes-token')
    }),
    getChanges: createMockFunction((dataType) => {
      const validationError = validateChangeTrackedDataType(dataType)
      if (validationError !== undefined) return Promise.reject(validationError)
      return rejectWhenUnavailable({
        tokenExpired: false,
        changes: [],
        nextChangesToken: 'mock-changes-token',
        hasMore: false,
      })
    }),
    readActiveEnergyBurned: createMockFunction((query) => readSamples('activeEnergyBurned', query)),
    readHydration: createMockFunction((query) => readSamples('hydration', query)),
    readFloorsClimbed: createMockFunction((query) => readSamples('floorsClimbed', query)),
    readSteps: createMockFunction((query) => readSamples('steps', query)),
    readDistance: createMockFunction((query) => readSamples('distance', query)),
    readBodyMass: createMockFunction((query) => readSamples('bodyMass', query)),
    readHeartRate: createMockFunction((query) => readSamples('heartRate', query)),
    readBloodPressure: createMockFunction((query) => readSamples('bloodPressure', query)),
    readBloodGlucose: createMockFunction((query) => readSamples('bloodGlucose', query)),
    readBodyTemperature: createMockFunction((query) => readSamples('bodyTemperature', query)),
    readRespiratoryRate: createMockFunction((query) => readSamples('respiratoryRate', query)),
    readBodyFat: createMockFunction((query) => readSamples('bodyFat', query)),
    readLeanBodyMass: createMockFunction((query) => readSamples('leanBodyMass', query)),
    readBasalBodyTemperature: createMockFunction((query) =>
      readSamples('basalBodyTemperature', query)
    ),
    readHeartRateStatistics: createMockFunction(() => rejectWhenUnavailable({})),
    readRestingHeartRate: createMockFunction((query) => readSamples('restingHeartRate', query)),
    readHeartRateVariability: createMockFunction(() => rejectWhenUnavailable({ samples: [] })),
    readOxygenSaturation: createMockFunction((query) => readSamples('oxygenSaturation', query)),
    readHeight: createMockFunction((query) => readSamples('height', query)),
    readVo2Max: createMockFunction((query) => readSamples('vo2Max', query)),
    readStatistics: createMockFunction(() => rejectWhenUnavailable([])),
    readSleepSamples: createMockFunction((query) => readSamples('sleep', query)),
    readWorkouts: createMockFunction((query) => readSamples('workout', query)),
    readNutrition: createMockFunction((query) => readSamples('nutrition', query)),
    saveSteps: createMockFunction((samples) => saveSamples('steps', samples)),
    saveDistance: createMockFunction((samples) =>
      saveSamples(
        'distance',
        samples,
        (sample) => {
          const fields = { ...sample }
          delete fields.device
          delete fields.recordingMethod
          delete fields.sync
          delete fields.scope
          return {
            ...fields,
            scope: profileName === 'observer' ? 'walking-running' : 'activity-unspecified',
          }
        },
        { storedScope: profileName === 'observer' ? 'walking-running' : 'activity-unspecified' }
      )
    ),
    saveActiveEnergyBurned: createMockFunction((samples) =>
      saveSamples('activeEnergyBurned', samples)
    ),
    saveHydration: createMockFunction((samples) => saveSamples('hydration', samples)),
    saveFloorsClimbed: createMockFunction((samples) => saveSamples('floorsClimbed', samples)),
    saveHeartRate: createMockFunction((samples) => saveSamples('heartRate', samples)),
    saveBloodPressure: createMockFunction((samples) => saveSamples('bloodPressure', samples)),
    saveBloodGlucose: createMockFunction((samples) => saveSamples('bloodGlucose', samples)),
    saveBodyTemperature: createMockFunction((samples) => saveSamples('bodyTemperature', samples)),
    saveRespiratoryRate: createMockFunction((samples) => saveSamples('respiratoryRate', samples)),
    saveBodyFat: createMockFunction((samples) => saveSamples('bodyFat', samples)),
    saveLeanBodyMass: createMockFunction((samples) => saveSamples('leanBodyMass', samples)),
    saveBasalBodyTemperature: createMockFunction((samples) =>
      saveSamples('basalBodyTemperature', samples)
    ),
    saveBodyMass: createMockFunction((samples) =>
      saveSamples('bodyMass', samples, makeBodyMassFields)
    ),
    saveRestingHeartRate: createMockFunction((samples) => saveSamples('restingHeartRate', samples)),
    saveOxygenSaturation: createMockFunction((samples) => saveSamples('oxygenSaturation', samples)),
    saveHeight: createMockFunction((samples) => saveSamples('height', samples)),
    saveVo2Max: createMockFunction((samples) => saveSamples('vo2Max', samples)),
    saveSleepSessions: createMockFunction((sessions) => {
      const validationError = validateNonEmpty(sessions, 'At least one sleep session is required')
      if (validationError !== undefined) return Promise.reject(validationError)
      return saveSamples('sleep', sessions, (session) => ({
        kind: 'session-envelope',
        startDate: session.startDate,
        endDate: session.endDate,
        stageData:
          Array.isArray(session.stages) && session.stages.length > 0 ? 'reported' : 'not-reported',
      }))
    }),
    saveWorkout: createMockFunction((workout) =>
      saveSamples('workout', [workout], (sample) => {
        const storedWorkout = {
          startDate: sample.startDate,
          endDate: sample.endDate,
          elapsedDurationSeconds: (sample.endDate.getTime() - sample.startDate.getTime()) / 1000,
          activeDuration: { status: 'not-reported' },
          activity: {
            status: 'known',
            type: sample.activityType,
            portability: 'portable',
            mapping: 'exact',
          },
          totalDistance: { status: 'not-reported' },
          totalActiveEnergyBurned: { status: 'not-reported' },
        }
        if (sample.displayName !== undefined) {
          if (profileName === 'observer') storedWorkout.brandName = sample.displayName
          else storedWorkout.title = sample.displayName
        }
        return storedWorkout
      })
    ),
    saveNutrition: createMockFunction((samples) => saveSamples('nutrition', samples)),
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
