import type { HealthDataOrigin } from '../HealthDataOrigin'
import type { HealthDeviceInfo, HealthDeviceType } from '../HealthDeviceInfo'
import type { HealthRecordSync } from '../HealthRecordSync'
import type { HealthRecordingMethod } from '../HealthRecordingMethod'
import type { HealthSampleIdentity } from '../HealthSampleIdentity'
import type { HealthSample } from '../HealthSample'
import type { HealthWriteMetadataInput } from '../HealthWriteMetadataInput'
import type { HealthWriteProvenanceInput } from '../HealthWriteProvenanceInput'
import type { NativeHealthDataOrigin } from '../NativeHealthDataOrigin'
import type { NativeHealthDeviceInfo } from '../NativeHealthDeviceInfo'
import type { NativeHealthRecordingMethod } from '../NativeHealthRecordingMethod'
import type { NativeHealthSampleIdentity } from '../NativeHealthSampleIdentity'
import type { NativeHealthSampleMetadata } from '../NativeHealthSampleMetadata'
import type { NativeHealthSyncMetadata } from '../NativeHealthSyncMetadata'
import type { NativeHealthWriteMetadata } from '../NativeHealthWriteMetadata'
import type { NativeHealthWriteProvenance } from '../NativeHealthWriteProvenance'

export function makeNativeSync(
  sync: HealthRecordSync | undefined,
  indexOrPrefix: number | string
): NativeHealthSyncMetadata | undefined {
  if (sync === undefined) return undefined

  const prefix = typeof indexOrPrefix === 'number' ? `samples[${indexOrPrefix}]` : indexOrPrefix

  if (typeof sync !== 'object' || sync === null) {
    throw new Error(`${prefix}: sync must contain an id and version`)
  }

  if (typeof sync.id !== 'string' || sync.id.trim() === '') {
    throw new Error(`${prefix}: sync.id must be a non-empty string`)
  }

  if (!Number.isSafeInteger(sync.version) || sync.version < 0) {
    throw new Error(`${prefix}: sync.version must be a non-negative safe integer`)
  }

  return { id: sync.id, version: sync.version }
}

function makeNativeRecordingMethod(
  recordingMethod: HealthRecordingMethod | undefined,
  indexOrPrefix: number | string
): NativeHealthRecordingMethod | undefined {
  switch (recordingMethod) {
    case undefined:
    case 'manual':
    case 'unknown':
      return recordingMethod
    case 'actively-recorded':
      return 'activelyRecorded'
    case 'automatically-recorded':
      return 'automaticallyRecorded'
    default:
      const prefix = typeof indexOrPrefix === 'number' ? `samples[${indexOrPrefix}]` : indexOrPrefix
      throw new Error(`${prefix}: unsupported recording method '${recordingMethod}'`)
  }
}

function makeNativeHealthDeviceInfo(
  device: HealthDeviceInfo | undefined,
  indexOrPrefix: number | string
): NativeHealthDeviceInfo | undefined {
  if (device === undefined) return undefined

  const prefix = typeof indexOrPrefix === 'number' ? `samples[${indexOrPrefix}]` : indexOrPrefix
  if (typeof device !== 'object' || device === null || Array.isArray(device)) {
    throw new Error(`${prefix}: device must be an object when provided`)
  }

  const supportedKeys = new Set(['type', 'manufacturer', 'model'])
  const unsupportedKey = Object.keys(device).find((key) => !supportedKeys.has(key))
  if (unsupportedKey !== undefined) {
    throw new Error(`${prefix}: device.${unsupportedKey} is unsupported`)
  }

  let type: NativeHealthDeviceInfo['type']
  switch (device.type) {
    case undefined:
    case 'unknown':
    case 'watch':
    case 'phone':
    case 'scale':
    case 'ring':
      type = device.type
      break
    case 'head-mounted':
      type = 'headMounted'
      break
    case 'fitness-band':
      type = 'fitnessBand'
      break
    case 'chest-strap':
      type = 'chestStrap'
      break
    case 'smart-display':
      type = 'smartDisplay'
      break
    default:
      throw new Error(`${prefix}: unsupported device type '${device.type}'`)
  }

  if (device.manufacturer !== undefined) {
    if (typeof device.manufacturer !== 'string' || device.manufacturer.trim() === '') {
      throw new Error(`${prefix}: device.manufacturer must be a non-empty string`)
    }
  }
  if (device.model !== undefined) {
    if (typeof device.model !== 'string' || device.model.trim() === '') {
      throw new Error(`${prefix}: device.model must be a non-empty string`)
    }
  }

  if (type === undefined && device.manufacturer === undefined && device.model === undefined) {
    return undefined
  }

  return {
    type,
    manufacturer: device.manufacturer,
    model: device.model,
  }
}

export function makeNativeWriteProvenance(
  sample: HealthWriteProvenanceInput,
  indexOrPrefix: number | string
): NativeHealthWriteProvenance {
  const device = makeNativeHealthDeviceInfo(sample.device, indexOrPrefix)
  return {
    deviceType: device?.type,
    deviceManufacturer: device?.manufacturer,
    deviceModel: device?.model,
    recordingMethod: makeNativeRecordingMethod(sample.recordingMethod, indexOrPrefix),
  }
}

export function assertTimeZoneIdentifier(
  timeZone: string | undefined,
  indexOrPrefix: number | string
): void {
  if (timeZone === undefined) return
  if (typeof timeZone !== 'string' || timeZone.trim() === '') {
    const prefix = typeof indexOrPrefix === 'number' ? `samples[${indexOrPrefix}]` : indexOrPrefix
    throw new Error(`${prefix}: timeZone must be a non-empty IANA time-zone identifier`)
  }
}

export function makeNativeWriteMetadata(
  sample: HealthWriteMetadataInput,
  indexOrPrefix: number | string
): NativeHealthWriteMetadata {
  assertTimeZoneIdentifier(sample.timeZone, indexOrPrefix)
  const sync = makeNativeSync(sample.sync, indexOrPrefix)
  const metadata: NativeHealthWriteMetadata = {
    provenance: makeNativeWriteProvenance(sample, indexOrPrefix),
  }
  if (sync !== undefined) metadata.sync = sync
  if (sample.timeZone !== undefined) metadata.timeZone = sample.timeZone
  return metadata
}

export function makeHealthRecordingMethod(
  recordingMethod: NativeHealthRecordingMethod
): HealthRecordingMethod {
  switch (recordingMethod) {
    case 'manual':
    case 'unknown':
      return recordingMethod
    case 'activelyRecorded':
      return 'actively-recorded'
    case 'automaticallyRecorded':
      return 'automatically-recorded'
    default:
      throw new Error(`Unsupported native recording method: ${recordingMethod}`)
  }
}

function makeHealthDataOrigin(origin: NativeHealthDataOrigin): HealthDataOrigin {
  if (typeof origin.identifier !== 'string' || origin.identifier.trim() === '') {
    throw new Error('Native health sample has an invalid origin identifier')
  }

  return {
    identifier: origin.identifier,
    displayName: origin.displayName,
  }
}

function makeHealthDeviceType(type: NativeHealthDeviceInfo['type']): HealthDeviceType | undefined {
  switch (type) {
    case undefined:
    case 'unknown':
    case 'watch':
    case 'phone':
    case 'scale':
    case 'ring':
      return type
    case 'headMounted':
      return 'head-mounted'
    case 'fitnessBand':
      return 'fitness-band'
    case 'chestStrap':
      return 'chest-strap'
    case 'smartDisplay':
      return 'smart-display'
    default:
      throw new Error(`Unsupported native health device type: ${type}`)
  }
}

function makeHealthDeviceInfo(
  device: NativeHealthDeviceInfo | undefined
): HealthDeviceInfo | undefined {
  if (device === undefined) return undefined
  if (device.manufacturer !== undefined && typeof device.manufacturer !== 'string') {
    throw new Error('Native health device has an invalid manufacturer')
  }
  if (device.model !== undefined && typeof device.model !== 'string') {
    throw new Error('Native health device has an invalid model')
  }

  const type = makeHealthDeviceType(device.type)
  const manufacturer = device.manufacturer?.trim() === '' ? undefined : device.manufacturer
  const model = device.model?.trim() === '' ? undefined : device.model

  if (type === undefined && manufacturer === undefined && model === undefined) {
    return undefined
  }

  const info: HealthDeviceInfo = {}
  if (type !== undefined) info.type = type
  if (manufacturer !== undefined) info.manufacturer = manufacturer
  if (model !== undefined) info.model = model
  return info
}

export function makeHealthSampleMetadata(sampleMetadata: NativeHealthSampleMetadata): HealthSample {
  const device = makeHealthDeviceInfo({
    type: sampleMetadata.deviceType,
    manufacturer: sampleMetadata.deviceManufacturer,
    model: sampleMetadata.deviceModel,
  })
  const metadata: HealthSample = {
    identity: makeHealthSampleIdentity({
      kind: sampleMetadata.identityKind,
      id: sampleMetadata.identityId,
      recordId: sampleMetadata.identityRecordId,
    }),
    origin: makeHealthDataOrigin({
      identifier: sampleMetadata.originIdentifier,
      displayName: sampleMetadata.originDisplayName,
    }),
    recordingMethod: makeHealthRecordingMethod(sampleMetadata.recordingMethod),
  }
  if (device !== undefined) metadata.device = device
  if (sampleMetadata.zoneOffset !== undefined) metadata.zoneOffset = sampleMetadata.zoneOffset
  if (sampleMetadata.timeZone !== undefined) metadata.timeZone = sampleMetadata.timeZone
  return metadata
}

function makeHealthSampleIdentity(identity: NativeHealthSampleIdentity): HealthSampleIdentity {
  if (typeof identity.id !== 'string' || identity.id.trim() === '') {
    throw new Error('Native health sample has an invalid identity id')
  }
  if (typeof identity.recordId !== 'string' || identity.recordId.trim() === '') {
    throw new Error('Native health sample has an invalid record id')
  }

  if (identity.kind === 'record') {
    if (identity.id !== identity.recordId) {
      throw new Error('Native record identity id does not match its record id')
    }
    return { kind: 'record', id: identity.id }
  }

  if (identity.kind === 'recordChild') {
    return {
      kind: 'record-child',
      id: identity.id,
      record: { kind: 'record', id: identity.recordId },
    }
  }

  throw new Error(`Unsupported native health identity kind: ${identity.kind}`)
}
