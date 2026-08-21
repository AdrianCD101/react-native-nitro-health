import {
  mockNitroHealth,
  nativeRecordChildMetadata,
  nativeRecordMetadata,
} from './support/mockNitroHealth'

jest.mock('react-native-nitro-modules', () => ({
  NitroModules: {
    createHybridObject: jest.fn(() => mockNitroHealth),
  },
}))

import { NitroHealth, type HealthPermission } from 'react-native-nitro-health'

describe('NitroHealth workflow and permission contract', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockNitroHealth.getAvailability.mockReturnValue({ status: 'available' })
  })

  it('maps availability, actionable recovery, and recovery outcomes', async () => {
    mockNitroHealth.getAvailability.mockReturnValue({
      status: 'unavailable',
      reason: 'providerInstallOrUpdateRequired',
      recovery: 'installOrUpdateProvider',
    })
    mockNitroHealth.performAvailabilityRecovery.mockResolvedValue('opened')

    const availability = NitroHealth.getAvailability()
    expect(availability).toEqual({
      status: 'unavailable',
      reason: 'provider-install-or-update-required',
      recovery: { kind: 'install-or-update-provider' },
    })
    if (availability.status === 'available' || !('recovery' in availability)) {
      throw new Error('Expected recoverable health availability')
    }

    await expect(NitroHealth.performAvailabilityRecovery(availability.recovery)).resolves.toEqual({
      status: 'user-action-required',
      destination: 'provider-store',
    })
    expect(mockNitroHealth.performAvailabilityRecovery).toHaveBeenCalledWith()

    mockNitroHealth.performAvailabilityRecovery.mockResolvedValue('destinationUnavailable')
    await expect(NitroHealth.performAvailabilityRecovery(availability.recovery)).resolves.toEqual({
      status: 'unavailable',
      reason: 'destination-unavailable',
    })
  })

  it('maps available and terminal unavailable states', () => {
    mockNitroHealth.getAvailability.mockReturnValue({ status: 'available' })
    expect(NitroHealth.getAvailability()).toEqual({ status: 'available' })

    mockNitroHealth.getAvailability.mockReturnValue({
      status: 'unavailable',
      reason: 'notSupported',
    })
    expect(NitroHealth.getAvailability()).toEqual({
      status: 'unavailable',
      reason: 'not-supported',
    })

    mockNitroHealth.getAvailability.mockReturnValue({
      status: 'unavailable',
      reason: 'serviceUnavailable',
    })
    expect(NitroHealth.getAvailability()).toEqual({
      status: 'unavailable',
      reason: 'service-unavailable',
    })
  })

  it('rejects malformed native availability states', () => {
    mockNitroHealth.getAvailability.mockReturnValue({
      status: 'available',
      reason: 'notSupported',
    })
    expect(() => NitroHealth.getAvailability()).toThrow(
      'Available native health service contains unavailable-state fields'
    )

    mockNitroHealth.getAvailability.mockReturnValue({ status: 'unavailable' })
    expect(() => NitroHealth.getAvailability()).toThrow('Native health availability is incomplete')

    mockNitroHealth.getAvailability.mockReturnValue({
      status: 'unavailable',
      reason: 'providerInstallOrUpdateRequired',
    })
    expect(() => NitroHealth.getAvailability()).toThrow(
      'Recoverable native health availability is missing its recovery action'
    )

    mockNitroHealth.getAvailability.mockReturnValue({
      status: 'unavailable',
      reason: 'notSupported',
      recovery: 'installOrUpdateProvider',
    })
    expect(() => NitroHealth.getAvailability()).toThrow(
      'Unrecoverable native health availability contains a recovery action'
    )
  })

  it('maps observer and polling capabilities without consulting Platform.OS', async () => {
    mockNitroHealth.getCapabilities.mockResolvedValueOnce({
      backgroundChangesMode: 'observer',
      backgroundRead: 'included',
      historyRead: 'included',
    })
    mockNitroHealth.getCapabilities.mockResolvedValueOnce({
      backgroundChangesMode: 'polling',
      backgroundRead: 'notGranted',
      historyRead: 'granted',
    })

    await expect(NitroHealth.getCapabilities()).resolves.toEqual({
      status: 'available',
      backgroundChanges: {
        mode: 'observer',
        frequencies: ['immediate', 'hourly', 'daily', 'weekly'],
        backgroundRead: 'included',
      },
      historyRead: 'included',
    })
    await expect(NitroHealth.getCapabilities()).resolves.toEqual({
      status: 'available',
      backgroundChanges: {
        mode: 'polling',
        scheduling: 'app-owned',
        backgroundRead: 'not-granted',
      },
      historyRead: 'granted',
    })
  })

  it('maps additional access requests and validates the requested capability', async () => {
    mockNitroHealth.requestAdditionalAccess.mockResolvedValueOnce('notDeclared')
    mockNitroHealth.requestAdditionalAccess.mockResolvedValueOnce('granted')

    await expect(NitroHealth.requestAdditionalAccess('background-read')).resolves.toEqual({
      access: 'background-read',
      status: 'not-declared',
    })
    await expect(NitroHealth.requestAdditionalAccess('history-read')).resolves.toEqual({
      access: 'history-read',
      status: 'granted',
    })
    await expect(NitroHealth.requestAdditionalAccess('other' as never)).rejects.toThrow(
      'access must be background-read or history-read'
    )
    expect(mockNitroHealth.requestAdditionalAccess).toHaveBeenCalledTimes(2)
  })

  it('maps direct and manual permission-management outcomes', async () => {
    mockNitroHealth.managePermissions.mockResolvedValueOnce({
      status: 'userActionRequired',
      actionKind: 'opened',
      destination: 'healthConnectSettings',
    })
    mockNitroHealth.managePermissions.mockResolvedValueOnce({
      status: 'userActionRequired',
      actionKind: 'manual',
      destination: 'healthAppPermissions',
    })
    mockNitroHealth.managePermissions.mockResolvedValueOnce({
      status: 'unavailable',
      availability: { status: 'unavailable', reason: 'serviceUnavailable' },
    })

    await expect(NitroHealth.managePermissions()).resolves.toEqual({
      status: 'user-action-required',
      action: { kind: 'opened', destination: 'health-connect-settings' },
    })
    await expect(NitroHealth.managePermissions()).resolves.toEqual({
      status: 'user-action-required',
      action: { kind: 'manual', destination: 'health-app-permissions' },
    })
    await expect(NitroHealth.managePermissions()).resolves.toEqual({
      status: 'unavailable',
      availability: { status: 'unavailable', reason: 'service-unavailable' },
    })
  })

  it('maps completed, manual, and unavailable permission revocation outcomes', async () => {
    mockNitroHealth.revokeAllPermissions.mockResolvedValueOnce({ status: 'completed' })
    mockNitroHealth.revokeAllPermissions.mockResolvedValueOnce({
      status: 'userActionRequired',
      actionKind: 'manual',
      destination: 'healthAppPermissions',
    })
    mockNitroHealth.revokeAllPermissions.mockResolvedValueOnce({
      status: 'unavailable',
      availability: { status: 'unavailable', reason: 'notSupported' },
    })

    await expect(NitroHealth.revokeAllPermissions()).resolves.toEqual({ status: 'completed' })
    await expect(NitroHealth.revokeAllPermissions()).resolves.toEqual({
      status: 'user-action-required',
      action: { kind: 'manual', destination: 'health-app-permissions' },
    })
    await expect(NitroHealth.revokeAllPermissions()).resolves.toEqual({
      status: 'unavailable',
      availability: { status: 'unavailable', reason: 'not-supported' },
    })
  })

  it('returns one current state for each permission in input order', async () => {
    const permissions: HealthPermission[] = [
      { accessType: 'read', dataType: 'steps' },
      { accessType: 'write', dataType: 'sleep' },
      { accessType: 'read', dataType: 'heartRate' },
    ]
    mockNitroHealth.getPermissionStatuses.mockResolvedValue({
      availability: { status: 'available' },
      statuses: [
        { permission: permissions[0]!, status: 'unverifiable' },
        { permission: permissions[1]!, status: 'granted' },
        { permission: permissions[2]!, status: 'notDetermined' },
      ],
    })

    await expect(NitroHealth.getPermissionStatuses(permissions)).resolves.toEqual({
      status: 'available',
      statuses: [
        { permission: permissions[0], status: 'unverifiable' },
        { permission: permissions[1], status: 'granted' },
        { permission: permissions[2], status: 'notDetermined' },
      ],
    })
    expect(mockNitroHealth.getPermissionStatuses).toHaveBeenCalledWith(permissions)
    expect(mockNitroHealth.requestAuthorization).not.toHaveBeenCalled()
  })

  it('requires every unavailable permission status to be unverifiable', async () => {
    const permissions: HealthPermission[] = [
      { accessType: 'read', dataType: 'steps' },
      { accessType: 'write', dataType: 'sleep' },
    ]
    mockNitroHealth.getPermissionStatuses.mockResolvedValueOnce({
      availability: { status: 'unavailable', reason: 'serviceUnavailable' },
      statuses: permissions.map((permission) => ({ permission, status: 'unverifiable' as const })),
    })

    await expect(NitroHealth.getPermissionStatuses(permissions)).resolves.toEqual({
      status: 'unavailable',
      availability: { status: 'unavailable', reason: 'service-unavailable' },
      statuses: permissions.map((permission) => ({ permission, status: 'unverifiable' })),
    })

    mockNitroHealth.getPermissionStatuses.mockResolvedValueOnce({
      availability: { status: 'unavailable', reason: 'notSupported' },
      statuses: [
        { permission: permissions[0]!, status: 'unverifiable' },
        { permission: permissions[1]!, status: 'granted' },
      ],
    })
    await expect(NitroHealth.getPermissionStatuses(permissions)).rejects.toThrow(
      'Unavailable permission result contains a verifiable permission status'
    )
  })

  it('returns post-authorization state per permission instead of aggregate arrays', async () => {
    const permissions: HealthPermission[] = [
      { accessType: 'read', dataType: 'steps' },
      { accessType: 'write', dataType: 'steps' },
      { accessType: 'read', dataType: 'heartRate' },
    ]
    mockNitroHealth.requestAuthorization.mockResolvedValue({
      status: 'completed',
      availability: { status: 'available' },
      statuses: [
        { permission: permissions[0]!, status: 'granted' },
        { permission: permissions[1]!, status: 'notGranted' },
        { permission: permissions[2]!, status: 'unverifiable' },
      ],
    })

    await expect(NitroHealth.requestAuthorization(permissions)).resolves.toEqual({
      status: 'completed',
      statuses: [
        { permission: permissions[0], status: 'granted' },
        { permission: permissions[1], status: 'notGranted' },
        { permission: permissions[2], status: 'unverifiable' },
      ],
    })
    expect(mockNitroHealth.requestAuthorization).toHaveBeenCalledWith(permissions)
  })

  it('maps unavailable authorization with all entries unverifiable', async () => {
    const permissions: HealthPermission[] = [
      { accessType: 'read', dataType: 'steps' },
      { accessType: 'write', dataType: 'steps' },
    ]
    mockNitroHealth.requestAuthorization.mockResolvedValue({
      status: 'unavailable',
      availability: { status: 'unavailable', reason: 'notSupported' },
      statuses: permissions.map((permission) => ({ permission, status: 'unverifiable' as const })),
    })

    await expect(NitroHealth.requestAuthorization(permissions)).resolves.toEqual({
      status: 'unavailable',
      availability: { status: 'unavailable', reason: 'not-supported' },
      statuses: permissions.map((permission) => ({ permission, status: 'unverifiable' })),
    })
  })

  it('rejects empty permission workflows before crossing native', async () => {
    await expect(NitroHealth.getPermissionStatuses([])).rejects.toThrow(
      'At least one health permission is required'
    )
    await expect(NitroHealth.requestAuthorization([])).rejects.toThrow(
      'At least one health permission is required'
    )

    expect(mockNitroHealth.getPermissionStatuses).not.toHaveBeenCalled()
    expect(mockNitroHealth.requestAuthorization).not.toHaveBeenCalled()
  })

  it('maps record identity, origin, and distance scope for interval samples', async () => {
    const startDate = new Date('2026-01-01T00:00:00.000Z')
    const endDate = new Date('2026-01-02T00:00:00.000Z')
    const metadata = nativeRecordMetadata('record-1', 'com.example.health', 'Example Health')
    mockNitroHealth.readSteps.mockResolvedValue({
      samples: [
        { ...metadata, startTimeMs: startDate.getTime(), endTimeMs: endDate.getTime(), count: 123 },
      ],
    })
    mockNitroHealth.readDistance.mockResolvedValue({
      samples: [
        {
          ...metadata,
          startTimeMs: startDate.getTime(),
          endTimeMs: endDate.getTime(),
          distanceMeters: 1234,
          scope: 'walkingRunning',
        },
      ],
    })

    await expect(
      NitroHealth.readSteps({ startDate, endDate, limit: 25, ascending: false })
    ).resolves.toEqual({
      samples: [
        {
          identity: { kind: 'record', id: 'record-1' },
          origin: { identifier: 'com.example.health', displayName: 'Example Health' },
          recordingMethod: 'unknown',
          startDate,
          endDate,
          count: 123,
        },
      ],
    })
    await expect(NitroHealth.readDistance({ startDate, endDate })).resolves.toEqual({
      samples: [
        {
          identity: { kind: 'record', id: 'record-1' },
          origin: { identifier: 'com.example.health', displayName: 'Example Health' },
          recordingMethod: 'unknown',
          startDate,
          endDate,
          distanceMeters: 1234,
          scope: 'walking-running',
        },
      ],
    })
    expect(mockNitroHealth.readSteps).toHaveBeenCalledWith({
      startTimeMs: startDate.getTime(),
      endTimeMs: endDate.getTime(),
      limit: 25,
      ascending: false,
      originIdentifiers: [],
    })
  })

  it('maps record-child identity and origin for flattened heart-rate readings', async () => {
    const startDate = new Date('2026-01-01T00:00:00.000Z')
    const endDate = new Date('2026-01-02T00:00:00.000Z')
    mockNitroHealth.readHeartRate.mockResolvedValue({
      samples: [
        {
          ...nativeRecordChildMetadata(
            'heart-record#0',
            'heart-record',
            'com.example.watch',
            'Example Watch'
          ),
          timeMs: startDate.getTime(),
          bpm: 72,
        },
      ],
    })

    await expect(NitroHealth.readHeartRate({ startDate, endDate })).resolves.toEqual({
      samples: [
        {
          identity: {
            kind: 'record-child',
            id: 'heart-record#0',
            record: { kind: 'record', id: 'heart-record' },
          },
          origin: { identifier: 'com.example.watch', displayName: 'Example Watch' },
          recordingMethod: 'unknown',
          date: startDate,
          bpm: 72,
        },
      ],
    })
  })

  it('maps origin metadata for active-energy and body-mass records', async () => {
    const startDate = new Date('2026-01-01T00:00:00.000Z')
    const endDate = new Date('2026-01-02T00:00:00.000Z')
    mockNitroHealth.readActiveEnergyBurned.mockResolvedValue({
      samples: [
        {
          ...nativeRecordMetadata('energy-record', 'com.example.phone', 'Example Phone'),
          startTimeMs: startDate.getTime(),
          endTimeMs: endDate.getTime(),
          kilocalories: 321,
        },
      ],
    })
    mockNitroHealth.readBodyMass.mockResolvedValue({
      samples: [
        {
          ...nativeRecordMetadata('mass-record', 'com.example.scale', 'Example Scale'),
          startTimeMs: startDate.getTime(),
          endTimeMs: endDate.getTime(),
          kilograms: 72.5,
        },
      ],
    })

    const energy = await NitroHealth.readActiveEnergyBurned({ startDate, endDate })
    const bodyMass = await NitroHealth.readBodyMass({ startDate, endDate })

    expect(energy.samples[0]).toEqual({
      identity: { kind: 'record', id: 'energy-record' },
      origin: { identifier: 'com.example.phone', displayName: 'Example Phone' },
      recordingMethod: 'unknown',
      startDate,
      endDate,
      kilocalories: 321,
    })
    expect(bodyMass.samples[0]).toEqual({
      identity: { kind: 'record', id: 'mass-record' },
      origin: { identifier: 'com.example.scale', displayName: 'Example Scale' },
      recordingMethod: 'unknown',
      startDate,
      endDate,
      kilograms: 72.5,
    })
  })

  it('preserves tagged sleep session envelopes and explicit stage variants', async () => {
    const startDate = new Date('2026-01-01T00:00:00.000Z')
    const stageDate = new Date('2026-01-01T02:00:00.000Z')
    const endDate = new Date('2026-01-01T08:00:00.000Z')
    mockNitroHealth.readSleepSamples.mockResolvedValue({
      samples: [
        {
          ...nativeRecordMetadata('sleep-session', 'com.example.sleep', 'Sleep App'),
          kind: 'sessionEnvelope',
          startTimeMs: startDate.getTime(),
          endTimeMs: endDate.getTime(),
          stageData: 'reported',
        },
        {
          ...nativeRecordChildMetadata(
            'sleep-session#stage-0',
            'sleep-session',
            'com.example.sleep',
            'Sleep App'
          ),
          kind: 'stage',
          startTimeMs: stageDate.getTime(),
          endTimeMs: endDate.getTime(),
          stage: 'asleepREM',
        },
      ],
    })

    await expect(NitroHealth.readSleepSamples({ startDate, endDate })).resolves.toEqual({
      samples: [
        {
          identity: { kind: 'record', id: 'sleep-session' },
          origin: { identifier: 'com.example.sleep', displayName: 'Sleep App' },
          recordingMethod: 'unknown',
          kind: 'session-envelope',
          startDate,
          endDate,
          stageData: 'reported',
        },
        {
          identity: {
            kind: 'record-child',
            id: 'sleep-session#stage-0',
            record: { kind: 'record', id: 'sleep-session' },
          },
          origin: { identifier: 'com.example.sleep', displayName: 'Sleep App' },
          recordingMethod: 'unknown',
          kind: 'stage',
          startDate: stageDate,
          endDate,
          stage: 'asleepREM',
        },
      ],
    })
  })

  it('applies read defaults and validates date ranges before crossing native', async () => {
    const startDate = new Date('2026-01-01T00:00:00.000Z')
    const endDate = new Date('2026-01-02T00:00:00.000Z')
    mockNitroHealth.readSteps.mockResolvedValue({ samples: [] })

    await expect(NitroHealth.readSteps({ startDate, endDate })).resolves.toEqual({ samples: [] })
    expect(mockNitroHealth.readSteps).toHaveBeenCalledWith({
      startTimeMs: startDate.getTime(),
      endTimeMs: endDate.getTime(),
      limit: 1000,
      ascending: true,
      originIdentifiers: [],
    })

    jest.clearAllMocks()
    await expect(
      NitroHealth.readSteps({ startDate: new Date(Number.NaN), endDate })
    ).rejects.toThrow('A valid startDate is required')
    await expect(NitroHealth.readSteps({ startDate: endDate, endDate: startDate })).rejects.toThrow(
      'startDate must be before endDate'
    )
    await expect(NitroHealth.readSteps({ startDate, endDate, limit: 0 })).rejects.toThrow(
      'limit must be a positive integer'
    )
    // Limits beyond Int32 max would trap in Swift's Int(Double) narrowing or
    // saturate Kotlin's Double.toInt(), so they must be rejected in JS.
    await expect(
      NitroHealth.readSteps({ startDate, endDate, limit: 2_147_483_648 })
    ).rejects.toThrow('limit must be a positive integer no greater than 2147483647')
    await expect(NitroHealth.readSteps({ startDate, endDate, limit: 1e308 })).rejects.toThrow(
      'limit must be a positive integer no greater than 2147483647'
    )
    expect(mockNitroHealth.readSteps).not.toHaveBeenCalled()
  })
})
