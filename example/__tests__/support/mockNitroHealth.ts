import type { NitroHealth as NitroHealthSpec } from '../../../src/specs/nitro-health.nitro'
import type { NativeHealthDataOrigin } from '../../../src/NativeHealthDataOrigin'
import type { NativeHealthSampleIdentity } from '../../../src/NativeHealthSampleIdentity'

type NativeMethod = (...args: any[]) => any

interface NativeRecordMetadata {
  identity: NativeHealthSampleIdentity
  origin: NativeHealthDataOrigin
}

function mockNativeMethod<T extends NativeMethod>(): jest.Mock<ReturnType<T>, Parameters<T>> {
  return jest.fn<ReturnType<T>, Parameters<T>>()
}

/** Full native Nitro contract shared by the Jest wrapper tests. */
export const mockNitroHealth = {
  name: 'NitroHealth',
  toString: mockNativeMethod<NitroHealthSpec['toString']>(),
  equals: mockNativeMethod<NitroHealthSpec['equals']>(),
  dispose: mockNativeMethod<NitroHealthSpec['dispose']>(),
  getAvailability: mockNativeMethod<NitroHealthSpec['getAvailability']>(),
  performAvailabilityRecovery: mockNativeMethod<NitroHealthSpec['performAvailabilityRecovery']>(),
  getCapabilities: mockNativeMethod<NitroHealthSpec['getCapabilities']>(),
  requestAdditionalAccess: mockNativeMethod<NitroHealthSpec['requestAdditionalAccess']>(),
  managePermissions: mockNativeMethod<NitroHealthSpec['managePermissions']>(),
  revokeAllPermissions: mockNativeMethod<NitroHealthSpec['revokeAllPermissions']>(),
  getBackgroundChangesMode: mockNativeMethod<NitroHealthSpec['getBackgroundChangesMode']>(),
  configureBackgroundChanges: mockNativeMethod<NitroHealthSpec['configureBackgroundChanges']>(),
  disableBackgroundChanges: mockNativeMethod<NitroHealthSpec['disableBackgroundChanges']>(),
  setOnBackgroundChangeListener:
    mockNativeMethod<NitroHealthSpec['setOnBackgroundChangeListener']>(),
  acknowledgeBackgroundChange: mockNativeMethod<NitroHealthSpec['acknowledgeBackgroundChange']>(),
  createChangesToken: mockNativeMethod<NitroHealthSpec['createChangesToken']>(),
  getChanges: mockNativeMethod<NitroHealthSpec['getChanges']>(),
  readSteps: mockNativeMethod<NitroHealthSpec['readSteps']>(),
  readDistance: mockNativeMethod<NitroHealthSpec['readDistance']>(),
  readActiveEnergyBurned: mockNativeMethod<NitroHealthSpec['readActiveEnergyBurned']>(),
  readBodyMass: mockNativeMethod<NitroHealthSpec['readBodyMass']>(),
  readHeartRate: mockNativeMethod<NitroHealthSpec['readHeartRate']>(),
  readBloodPressure: mockNativeMethod<NitroHealthSpec['readBloodPressure']>(),
  readBloodGlucose: mockNativeMethod<NitroHealthSpec['readBloodGlucose']>(),
  readBodyTemperature: mockNativeMethod<NitroHealthSpec['readBodyTemperature']>(),
  readRespiratoryRate: mockNativeMethod<NitroHealthSpec['readRespiratoryRate']>(),
  readBodyFat: mockNativeMethod<NitroHealthSpec['readBodyFat']>(),
  readLeanBodyMass: mockNativeMethod<NitroHealthSpec['readLeanBodyMass']>(),
  readBasalBodyTemperature: mockNativeMethod<NitroHealthSpec['readBasalBodyTemperature']>(),
  readHeartRateStatistics: mockNativeMethod<NitroHealthSpec['readHeartRateStatistics']>(),
  readRestingHeartRate: mockNativeMethod<NitroHealthSpec['readRestingHeartRate']>(),
  readHeartRateVariability: mockNativeMethod<NitroHealthSpec['readHeartRateVariability']>(),
  readOxygenSaturation: mockNativeMethod<NitroHealthSpec['readOxygenSaturation']>(),
  readHeight: mockNativeMethod<NitroHealthSpec['readHeight']>(),
  readVo2Max: mockNativeMethod<NitroHealthSpec['readVo2Max']>(),
  readStatistics: mockNativeMethod<NitroHealthSpec['readStatistics']>(),
  readSleepSamples: mockNativeMethod<NitroHealthSpec['readSleepSamples']>(),
  readWorkouts: mockNativeMethod<NitroHealthSpec['readWorkouts']>(),
  saveSteps: mockNativeMethod<NitroHealthSpec['saveSteps']>(),
  saveDistance: mockNativeMethod<NitroHealthSpec['saveDistance']>(),
  saveActiveEnergyBurned: mockNativeMethod<NitroHealthSpec['saveActiveEnergyBurned']>(),
  saveHeartRate: mockNativeMethod<NitroHealthSpec['saveHeartRate']>(),
  saveBloodPressure: mockNativeMethod<NitroHealthSpec['saveBloodPressure']>(),
  saveBloodGlucose: mockNativeMethod<NitroHealthSpec['saveBloodGlucose']>(),
  saveBodyTemperature: mockNativeMethod<NitroHealthSpec['saveBodyTemperature']>(),
  saveRespiratoryRate: mockNativeMethod<NitroHealthSpec['saveRespiratoryRate']>(),
  saveBodyFat: mockNativeMethod<NitroHealthSpec['saveBodyFat']>(),
  saveLeanBodyMass: mockNativeMethod<NitroHealthSpec['saveLeanBodyMass']>(),
  saveBasalBodyTemperature: mockNativeMethod<NitroHealthSpec['saveBasalBodyTemperature']>(),
  saveBodyMass: mockNativeMethod<NitroHealthSpec['saveBodyMass']>(),
  saveRestingHeartRate: mockNativeMethod<NitroHealthSpec['saveRestingHeartRate']>(),
  saveOxygenSaturation: mockNativeMethod<NitroHealthSpec['saveOxygenSaturation']>(),
  saveHeight: mockNativeMethod<NitroHealthSpec['saveHeight']>(),
  saveVo2Max: mockNativeMethod<NitroHealthSpec['saveVo2Max']>(),
  saveSleepSessions: mockNativeMethod<NitroHealthSpec['saveSleepSessions']>(),
  saveWorkout: mockNativeMethod<NitroHealthSpec['saveWorkout']>(),
  deleteRecordsByIds: mockNativeMethod<NitroHealthSpec['deleteRecordsByIds']>(),
  deleteRecordsByTimeRange: mockNativeMethod<NitroHealthSpec['deleteRecordsByTimeRange']>(),
  getPermissionStatuses: mockNativeMethod<NitroHealthSpec['getPermissionStatuses']>(),
  requestAuthorization: mockNativeMethod<NitroHealthSpec['requestAuthorization']>(),
} satisfies NitroHealthSpec

export function nativeRecordMetadata(
  id: string,
  identifier = 'com.example.health',
  displayName?: string
): NativeRecordMetadata {
  return {
    identity: { kind: 'record' as const, id, recordId: id },
    origin: displayName === undefined ? { identifier } : { identifier, displayName },
  }
}

export function nativeRecordChildMetadata(
  id: string,
  recordId: string,
  identifier = 'com.example.health',
  displayName?: string
): NativeRecordMetadata {
  return {
    identity: { kind: 'recordChild' as const, id, recordId },
    origin: displayName === undefined ? { identifier } : { identifier, displayName },
  }
}
