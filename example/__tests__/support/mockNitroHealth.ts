import type { NitroHealth as NitroHealthSpec } from '../../../src/specs/nitro-health.nitro'
import type { NativeHealthDeviceInfo } from '../../../src/NativeHealthDeviceInfo'
import type { NativeHealthRecordingMethod } from '../../../src/NativeHealthRecordingMethod'
import type { NativeHealthSampleMetadata } from '../../../src/NativeHealthSampleMetadata'

type NativeMethod = (...args: any[]) => any

interface NativeRecordMetadata {
  sampleMetadata: NativeHealthSampleMetadata
}

function mockNativeMethod<T extends NativeMethod>(): jest.Mock<ReturnType<T>, Parameters<T>> {
  return jest.fn<ReturnType<T>, Parameters<T>>()
}

/** Full native Nitro contract shared by the Jest wrapper tests. */
export const mockNitroHealth = {
  name: 'NitroHealth',
  ownOrigin: { identifier: 'com.nitrohealth.mock', displayName: 'Nitro Health Mock' },
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
  readHydration: mockNativeMethod<NitroHealthSpec['readHydration']>(),
  readFloorsClimbed: mockNativeMethod<NitroHealthSpec['readFloorsClimbed']>(),
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
  readNutrition: mockNativeMethod<NitroHealthSpec['readNutrition']>(),
  saveSteps: mockNativeMethod<NitroHealthSpec['saveSteps']>().mockResolvedValue({
    storedRecordingMethods: ['unknown'],
  }),
  saveDistance: mockNativeMethod<NitroHealthSpec['saveDistance']>().mockResolvedValue({
    storedScope: 'walkingRunning',
    storedRecordingMethods: ['unknown'],
  }),
  saveActiveEnergyBurned: mockNativeMethod<
    NitroHealthSpec['saveActiveEnergyBurned']
  >().mockResolvedValue({
    storedRecordingMethods: ['unknown'],
  }),
  saveHydration: mockNativeMethod<NitroHealthSpec['saveHydration']>().mockResolvedValue({
    storedRecordingMethods: ['unknown'],
  }),
  saveFloorsClimbed: mockNativeMethod<NitroHealthSpec['saveFloorsClimbed']>().mockResolvedValue({
    storedRecordingMethods: ['unknown'],
  }),
  saveHeartRate: mockNativeMethod<NitroHealthSpec['saveHeartRate']>().mockResolvedValue({
    storedRecordingMethods: ['unknown'],
  }),
  saveBloodPressure: mockNativeMethod<NitroHealthSpec['saveBloodPressure']>().mockResolvedValue({
    storedRecordingMethods: ['unknown'],
  }),
  saveBloodGlucose: mockNativeMethod<NitroHealthSpec['saveBloodGlucose']>().mockResolvedValue({
    storedRecordingMethods: ['unknown'],
  }),
  saveBodyTemperature: mockNativeMethod<NitroHealthSpec['saveBodyTemperature']>().mockResolvedValue(
    {
      storedRecordingMethods: ['unknown'],
    }
  ),
  saveRespiratoryRate: mockNativeMethod<NitroHealthSpec['saveRespiratoryRate']>().mockResolvedValue(
    {
      storedRecordingMethods: ['unknown'],
    }
  ),
  saveBodyFat: mockNativeMethod<NitroHealthSpec['saveBodyFat']>().mockResolvedValue({
    storedRecordingMethods: ['unknown'],
  }),
  saveLeanBodyMass: mockNativeMethod<NitroHealthSpec['saveLeanBodyMass']>().mockResolvedValue({
    storedRecordingMethods: ['unknown'],
  }),
  saveBasalBodyTemperature: mockNativeMethod<
    NitroHealthSpec['saveBasalBodyTemperature']
  >().mockResolvedValue({
    storedRecordingMethods: ['unknown'],
  }),
  saveBodyMass: mockNativeMethod<NitroHealthSpec['saveBodyMass']>().mockResolvedValue({
    storedRecordingMethods: ['unknown'],
  }),
  saveRestingHeartRate: mockNativeMethod<
    NitroHealthSpec['saveRestingHeartRate']
  >().mockResolvedValue({
    storedRecordingMethods: ['unknown'],
  }),
  saveOxygenSaturation: mockNativeMethod<
    NitroHealthSpec['saveOxygenSaturation']
  >().mockResolvedValue({
    storedRecordingMethods: ['unknown'],
  }),
  saveHeight: mockNativeMethod<NitroHealthSpec['saveHeight']>().mockResolvedValue({
    storedRecordingMethods: ['unknown'],
  }),
  saveVo2Max: mockNativeMethod<NitroHealthSpec['saveVo2Max']>().mockResolvedValue({
    storedRecordingMethods: ['unknown'],
  }),
  saveSleepSessions: mockNativeMethod<NitroHealthSpec['saveSleepSessions']>().mockResolvedValue({
    storedRecordingMethods: ['unknown'],
  }),
  saveWorkout: mockNativeMethod<NitroHealthSpec['saveWorkout']>().mockResolvedValue({
    storedRecordingMethods: ['unknown'],
  }),
  saveNutrition: mockNativeMethod<NitroHealthSpec['saveNutrition']>().mockResolvedValue({
    storedRecordingMethods: ['unknown'],
  }),
  deleteRecordsByIds: mockNativeMethod<NitroHealthSpec['deleteRecordsByIds']>(),
  deleteRecordsByTimeRange: mockNativeMethod<NitroHealthSpec['deleteRecordsByTimeRange']>(),
  getPermissionStatuses: mockNativeMethod<NitroHealthSpec['getPermissionStatuses']>(),
  requestAuthorization: mockNativeMethod<NitroHealthSpec['requestAuthorization']>(),
} satisfies NitroHealthSpec

export function nativeRecordMetadata(
  id: string,
  identifier = 'com.example.health',
  displayName?: string,
  recordingMethod: NativeHealthRecordingMethod = 'unknown',
  device?: NativeHealthDeviceInfo,
  zone?: { zoneOffset?: string; timeZone?: string }
): NativeRecordMetadata {
  const sampleMetadata: NativeHealthSampleMetadata = {
    identityKind: 'record',
    identityId: id,
    identityRecordId: id,
    originIdentifier: identifier,
    recordingMethod,
  }
  if (displayName !== undefined) sampleMetadata.originDisplayName = displayName
  if (device?.type !== undefined) sampleMetadata.deviceType = device.type
  if (device?.manufacturer !== undefined) sampleMetadata.deviceManufacturer = device.manufacturer
  if (device?.model !== undefined) sampleMetadata.deviceModel = device.model
  if (zone?.zoneOffset !== undefined) sampleMetadata.zoneOffset = zone.zoneOffset
  if (zone?.timeZone !== undefined) sampleMetadata.timeZone = zone.timeZone
  return { sampleMetadata }
}

export function nativeRecordChildMetadata(
  id: string,
  recordId: string,
  identifier = 'com.example.health',
  displayName?: string,
  recordingMethod: NativeHealthRecordingMethod = 'unknown',
  device?: NativeHealthDeviceInfo
): NativeRecordMetadata {
  const sampleMetadata: NativeHealthSampleMetadata = {
    identityKind: 'recordChild',
    identityId: id,
    identityRecordId: recordId,
    originIdentifier: identifier,
    recordingMethod,
  }
  if (displayName !== undefined) sampleMetadata.originDisplayName = displayName
  if (device?.type !== undefined) sampleMetadata.deviceType = device.type
  if (device?.manufacturer !== undefined) sampleMetadata.deviceManufacturer = device.manufacturer
  if (device?.model !== undefined) sampleMetadata.deviceModel = device.model
  return { sampleMetadata }
}
