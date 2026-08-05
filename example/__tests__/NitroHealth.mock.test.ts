import {
  NitroHealth,
  createNitroHealthMock,
  resetNitroHealthMock,
} from 'react-native-nitro-health/jest/mock'

describe('NitroHealth Jest mock', () => {
  beforeEach(() => {
    resetNitroHealthMock()
  })

  it('provides the polling profile and redesigned public workflows by default', async () => {
    expect(NitroHealth.getAvailability()).toEqual({ status: 'available' })
    await expect(
      NitroHealth.performAvailabilityRecovery({ kind: 'install-or-update-provider' })
    ).resolves.toEqual({ status: 'unavailable', reason: 'no-recovery-action' })
    await expect(NitroHealth.getCapabilities()).resolves.toEqual({
      status: 'available',
      backgroundChanges: {
        mode: 'polling',
        scheduling: 'app-owned',
        backgroundRead: 'not-granted',
      },
      historyRead: 'not-granted',
    })
    await expect(NitroHealth.requestAdditionalAccess('background-read')).resolves.toEqual({
      access: 'background-read',
      status: 'not-granted',
    })
    await expect(NitroHealth.requestAdditionalAccess('history-read')).resolves.toEqual({
      access: 'history-read',
      status: 'not-granted',
    })
    await expect(NitroHealth.managePermissions()).resolves.toEqual({
      status: 'user-action-required',
      action: { kind: 'opened', destination: 'health-connect-settings' },
    })
    await expect(NitroHealth.revokeAllPermissions()).resolves.toEqual({ status: 'completed' })
    await expect(
      NitroHealth.configureBackgroundChanges({ dataTypes: ['steps'], frequency: 'hourly' })
    ).resolves.toEqual({
      status: 'user-action-required',
      mode: 'polling',
      scheduling: 'app-owned',
      backgroundRead: 'not-granted',
    })
    await expect(NitroHealth.disableBackgroundChanges()).resolves.toEqual({
      status: 'user-action-required',
      mode: 'polling',
      scheduling: 'app-owned',
      backgroundRead: 'not-granted',
    })
    expect(NitroHealth.subscribeToBackgroundChanges(jest.fn())).toEqual({
      mode: 'polling',
      scheduling: 'app-owned',
    })
  })

  it('provides default reads, writes, changes, and typed deletion outcomes', async () => {
    const range = {
      startDate: new Date('2026-01-01T00:00:00.000Z'),
      endDate: new Date('2026-01-02T00:00:00.000Z'),
    }

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
    await expect(NitroHealth.readBloodPressure(range)).resolves.toEqual({ samples: [] })
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

    const stepInput = {
      ...range,
      count: 100,
      sync: { id: 'mock-step-record', version: 0 },
    }
    await expect(NitroHealth.saveSteps([stepInput])).resolves.toBeUndefined()
    expect(NitroHealth.saveSteps).toHaveBeenCalledWith([stepInput])
    await expect(
      NitroHealth.saveDistance([{ ...range, scope: 'walking-running', distanceMeters: 1000 }])
    ).resolves.toEqual({ status: 'completed', storedScope: 'activity-unspecified' })
    await expect(
      NitroHealth.saveSleepSessions([{ ...range, timeZone: 'UTC' }])
    ).resolves.toBeUndefined()
    await expect(
      NitroHealth.saveWorkout({
        ...range,
        activityType: 'running',
        displayName: 'Mock run',
      })
    ).resolves.toBeUndefined()

    await expect(
      NitroHealth.deleteRecordsByIds('steps', [
        { kind: 'record', id: 'record-1' },
        { kind: 'record', id: 'record-2' },
      ])
    ).resolves.toEqual({
      status: 'completed',
      requestedCount: 2,
      deletedCount: { status: 'known', value: 2 },
    })
    await expect(NitroHealth.deleteRecordsByTimeRange('steps', range)).resolves.toEqual({
      status: 'completed',
      deletedCount: { status: 'unverifiable' },
    })
  })

  it('returns per-entry permission states from the polling profile', async () => {
    const permissions = [
      { accessType: 'read' as const, dataType: 'steps' as const },
      { accessType: 'write' as const, dataType: 'steps' as const },
    ]

    await expect(NitroHealth.getPermissionStatuses(permissions)).resolves.toEqual({
      status: 'available',
      statuses: permissions.map((permission) => ({ permission, status: 'notGranted' })),
    })
    await expect(NitroHealth.requestAuthorization(permissions)).resolves.toEqual({
      status: 'completed',
      statuses: permissions.map((permission) => ({ permission, status: 'notGranted' })),
    })
  })

  it('creates an isolated observer profile', async () => {
    const observer = createNitroHealthMock({ profile: 'observer' })
    const readPermission = { accessType: 'read' as const, dataType: 'heartRate' as const }
    const writePermission = { accessType: 'write' as const, dataType: 'workout' as const }

    await expect(observer.getCapabilities()).resolves.toEqual({
      status: 'available',
      backgroundChanges: {
        mode: 'observer',
        frequencies: ['immediate', 'hourly', 'daily', 'weekly'],
        backgroundRead: 'included',
      },
      historyRead: 'included',
    })
    await expect(observer.requestAdditionalAccess('background-read')).resolves.toEqual({
      access: 'background-read',
      status: 'included',
    })
    await expect(observer.requestAdditionalAccess('history-read')).resolves.toEqual({
      access: 'history-read',
      status: 'included',
    })
    await expect(
      observer.configureBackgroundChanges({ dataTypes: ['steps'], frequency: 'daily' })
    ).resolves.toEqual({ status: 'completed', mode: 'observer' })
    await expect(observer.managePermissions()).resolves.toEqual({
      status: 'user-action-required',
      action: { kind: 'manual', destination: 'health-app-permissions' },
    })
    await expect(observer.revokeAllPermissions()).resolves.toEqual({
      status: 'user-action-required',
      action: { kind: 'manual', destination: 'health-app-permissions' },
    })
    const subscription = observer.subscribeToBackgroundChanges(jest.fn())
    expect(subscription.mode).toBe('observer')
    if (subscription.mode === 'observer') subscription.subscription.remove()
    await expect(
      observer.saveDistance([
        {
          startDate: new Date('2026-01-01T00:00:00.000Z'),
          endDate: new Date('2026-01-01T01:00:00.000Z'),
          scope: 'walking-running',
          distanceMeters: 1000,
        },
      ])
    ).resolves.toEqual({ status: 'completed', storedScope: 'walking-running' })
    await expect(
      observer.getPermissionStatuses([readPermission, writePermission])
    ).resolves.toEqual({
      status: 'available',
      statuses: [
        { permission: readPermission, status: 'unverifiable' },
        { permission: writePermission, status: 'notDetermined' },
      ],
    })
    expect(NitroHealth.subscribeToBackgroundChanges(jest.fn())).toEqual({
      mode: 'polling',
      scheduling: 'app-owned',
    })
  })

  it('creates an unavailable profile with unverifiable permission entries', async () => {
    const unavailable = createNitroHealthMock({ profile: 'unavailable' })
    const permissions = [
      { accessType: 'read' as const, dataType: 'steps' as const },
      { accessType: 'write' as const, dataType: 'sleep' as const },
    ]

    expect(unavailable.getAvailability()).toEqual({
      status: 'unavailable',
      reason: 'not-supported',
    })
    await expect(unavailable.getCapabilities()).resolves.toEqual({
      status: 'unavailable',
      availability: { status: 'unavailable', reason: 'not-supported' },
    })
    await expect(unavailable.requestAdditionalAccess('background-read')).resolves.toEqual({
      access: 'background-read',
      status: 'unavailable',
      availability: { status: 'unavailable', reason: 'not-supported' },
    })
    await expect(unavailable.requestAdditionalAccess('history-read')).resolves.toEqual({
      access: 'history-read',
      status: 'unavailable',
      availability: { status: 'unavailable', reason: 'not-supported' },
    })
    await expect(unavailable.managePermissions()).resolves.toEqual({
      status: 'unavailable',
      availability: { status: 'unavailable', reason: 'not-supported' },
    })
    await expect(unavailable.revokeAllPermissions()).resolves.toEqual({
      status: 'unavailable',
      availability: { status: 'unavailable', reason: 'not-supported' },
    })
    await expect(
      unavailable.configureBackgroundChanges({ dataTypes: ['steps'], frequency: 'hourly' })
    ).resolves.toEqual({ status: 'unavailable' })
    await expect(unavailable.disableBackgroundChanges()).resolves.toEqual({
      status: 'unavailable',
    })
    expect(unavailable.subscribeToBackgroundChanges(jest.fn())).toEqual({
      mode: 'unavailable',
      availability: { status: 'unavailable', reason: 'not-supported' },
    })
    await expect(unavailable.getPermissionStatuses(permissions)).resolves.toEqual({
      status: 'unavailable',
      availability: { status: 'unavailable', reason: 'not-supported' },
      statuses: permissions.map((permission) => ({ permission, status: 'unverifiable' })),
    })
    await expect(unavailable.requestAuthorization(permissions)).resolves.toEqual({
      status: 'unavailable',
      availability: { status: 'unavailable', reason: 'not-supported' },
      statuses: permissions.map((permission) => ({ permission, status: 'unverifiable' })),
    })
  })

  it('applies reset profile and nested overrides to the shared mock', async () => {
    const overriddenAvailability = jest.fn(() => ({
      status: 'unavailable' as const,
      reason: 'service-unavailable' as const,
    }))
    resetNitroHealthMock({
      profile: 'observer',
      overrides: { getAvailability: overriddenAvailability },
    })

    expect(NitroHealth.getAvailability()).toEqual({
      status: 'unavailable',
      reason: 'service-unavailable',
    })
    await expect(NitroHealth.getCapabilities()).resolves.toEqual({
      status: 'unavailable',
      availability: { status: 'unavailable', reason: 'service-unavailable' },
    })
    expect(overriddenAvailability).toHaveBeenCalledTimes(2)
  })

  it('rejects empty writes and background configuration like the public facade', async () => {
    await expect(NitroHealth.saveSteps([])).rejects.toThrow('At least one sample is required')
    await expect(NitroHealth.saveSleepSessions([])).rejects.toThrow(
      'At least one sleep session is required'
    )
    await expect(
      NitroHealth.configureBackgroundChanges({ dataTypes: [], frequency: 'hourly' })
    ).rejects.toThrow('At least one background change data type is required')
    await expect(NitroHealth.disableBackgroundChanges([])).rejects.toThrow(
      'dataTypes must be omitted or contain at least one health data type'
    )
  })

  it('applies create options without mutating the shared mock', () => {
    const isolated = createNitroHealthMock({
      profile: 'polling',
      overrides: {
        getAvailability: jest.fn(() => ({
          status: 'unavailable' as const,
          reason: 'service-unavailable' as const,
        })),
      },
    })

    expect(isolated.getAvailability()).toEqual({
      status: 'unavailable',
      reason: 'service-unavailable',
    })
    expect(NitroHealth.getAvailability()).toEqual({ status: 'available' })
  })
})
