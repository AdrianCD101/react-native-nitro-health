import type { BackgroundChangesConfigurationResult } from '../BackgroundChangesResult'
import type { HealthAvailability, HealthAvailabilityRecoveryResult } from '../HealthAvailability'
import type {
  HealthAdditionalAccess,
  HealthAdditionalAccessResult,
  HealthCapabilities,
} from '../HealthCapabilities'
import type { HealthIdentityDeleteResult, HealthTimeRangeDeleteResult } from '../HealthDeleteResult'
import type { HealthAuthorizationResult } from '../HealthAuthorizationResult'
import type { HealthPermission } from '../HealthPermission'
import type { HealthPermissionStatusResult } from '../HealthPermissionStatusResult'
import type { HealthPermissionStatusEntry } from '../HealthPermissionStatusEntry'
import type {
  HealthPermissionManagementResult,
  HealthPermissionRevocationResult,
} from '../HealthPermissionManagementResult'
import type { NativeBackgroundChangesResult } from '../NativeBackgroundChangesResult'
import type { NativeHealthAuthorizationResult } from '../NativeHealthAuthorizationResult'
import type {
  NativeHealthAvailability,
  NativeHealthAvailabilityRecoveryResult,
} from '../NativeHealthAvailability'
import type {
  NativeHealthAdditionalAccessStatus,
  NativeHealthCapabilities,
} from '../NativeHealthCapabilities'
import type { NativeHealthDeleteResult } from '../NativeHealthDeleteResult'
import type { NativeHealthPermissionStatusResult } from '../NativeHealthPermissionStatusResult'
import type { NativePermissionWorkflowResult } from '../NativePermissionWorkflowResult'

export function makeHealthAvailability(availability: NativeHealthAvailability): HealthAvailability {
  if (availability.status === 'available') {
    if (availability.reason !== undefined || availability.recovery !== undefined) {
      throw new Error('Available native health service contains unavailable-state fields')
    }
    return { status: 'available' }
  }

  if (availability.status !== 'unavailable' || availability.reason === undefined) {
    throw new Error('Native health availability is incomplete')
  }

  if (availability.reason === 'providerInstallOrUpdateRequired') {
    if (availability.recovery !== 'installOrUpdateProvider') {
      throw new Error('Recoverable native health availability is missing its recovery action')
    }
    return {
      status: 'unavailable',
      reason: 'provider-install-or-update-required',
      recovery: { kind: 'install-or-update-provider' },
    }
  }

  if (availability.recovery !== undefined) {
    throw new Error('Unrecoverable native health availability contains a recovery action')
  }
  if (availability.reason === 'notSupported') {
    return { status: 'unavailable', reason: 'not-supported' }
  }
  if (availability.reason === 'serviceUnavailable') {
    return { status: 'unavailable', reason: 'service-unavailable' }
  }
  throw new Error(`Unsupported native health availability reason: ${availability.reason}`)
}

export function makeAvailabilityRecoveryResult(
  result: NativeHealthAvailabilityRecoveryResult
): HealthAvailabilityRecoveryResult {
  if (result === 'opened') {
    return { status: 'user-action-required', destination: 'provider-store' }
  }
  if (result === 'noRecoveryAction') {
    return { status: 'unavailable', reason: 'no-recovery-action' }
  }
  if (result === 'destinationUnavailable') {
    return { status: 'unavailable', reason: 'destination-unavailable' }
  }
  throw new Error(`Unsupported native availability recovery result: ${result}`)
}

function makeAdditionalAccessStatus(
  status: NativeHealthAdditionalAccessStatus
): HealthCapabilities['historyRead'] {
  const nativeStatus: string = status
  switch (nativeStatus) {
    case 'included':
      return 'included'
    case 'unsupported':
      return 'unsupported'
    case 'notDeclared':
      return 'not-declared'
    case 'notGranted':
      return 'not-granted'
    case 'granted':
      return 'granted'
  }
  throw new Error(`Unsupported native additional access status: ${nativeStatus}`)
}

export function makeHealthCapabilities(capabilities: NativeHealthCapabilities): HealthCapabilities {
  const historyRead = makeAdditionalAccessStatus(capabilities.historyRead)
  if (capabilities.backgroundChangesMode === 'observer') {
    if (capabilities.backgroundRead !== 'included' || capabilities.historyRead !== 'included') {
      throw new Error('Observer capabilities require included background and historical access')
    }
    return {
      backgroundChanges: {
        mode: 'observer',
        frequencies: ['immediate', 'hourly', 'daily', 'weekly'],
        backgroundRead: 'included',
      },
      historyRead: 'included',
    }
  }

  if (capabilities.backgroundChangesMode !== 'polling') {
    throw new Error(
      `Unsupported native background changes mode: ${capabilities.backgroundChangesMode}`
    )
  }
  return {
    backgroundChanges: {
      mode: 'polling',
      scheduling: 'app-owned',
      backgroundRead: makeAdditionalAccessStatus(capabilities.backgroundRead),
    },
    historyRead,
  }
}

export function makeAdditionalAccessResult(
  access: HealthAdditionalAccess,
  status: NativeHealthAdditionalAccessStatus
): HealthAdditionalAccessResult {
  return { access, status: makeAdditionalAccessStatus(status) }
}

export function makeBackgroundChangesResult(
  result: NativeBackgroundChangesResult
): BackgroundChangesConfigurationResult {
  if (result.status === 'unavailable') return { status: 'unavailable' }
  if (result.mode === 'observer') {
    if (result.status !== 'completed' || result.backgroundRead !== 'included') {
      throw new Error('Native observer background result is inconsistent')
    }
    return { status: 'completed', mode: 'observer' }
  }
  if (result.status !== 'userActionRequired') {
    throw new Error('Native polling background result must require app-owned scheduling')
  }
  return {
    status: 'user-action-required',
    mode: 'polling',
    scheduling: 'app-owned',
    backgroundRead: makeAdditionalAccessStatus(result.backgroundRead),
  }
}

export function makePermissionManagementResult(
  result: NativePermissionWorkflowResult
): HealthPermissionManagementResult {
  if (result.status === 'unavailable') {
    if (result.availability === undefined) {
      throw new Error('Unavailable permission workflow is missing health availability')
    }
    const availability = makeHealthAvailability(result.availability)
    if (availability.status === 'available') {
      throw new Error('Unavailable permission workflow contains available health status')
    }
    return { status: 'unavailable', availability }
  }
  if (result.status !== 'userActionRequired') {
    throw new Error('Permission management cannot complete permission changes directly')
  }
  if (result.actionKind === 'opened' && result.destination === 'healthConnectSettings') {
    return {
      status: 'user-action-required',
      action: { kind: 'opened', destination: 'health-connect-settings' },
    }
  }
  if (result.actionKind === 'manual' && result.destination === 'healthAppPermissions') {
    return {
      status: 'user-action-required',
      action: { kind: 'manual', destination: 'health-app-permissions' },
    }
  }
  throw new Error('Native permission-management action is incomplete')
}

export function makePermissionRevocationResult(
  result: NativePermissionWorkflowResult
): HealthPermissionRevocationResult {
  if (result.status === 'completed') return { status: 'completed' }
  if (result.status === 'unavailable') {
    if (result.availability === undefined) {
      throw new Error('Unavailable revocation workflow is missing health availability')
    }
    const availability = makeHealthAvailability(result.availability)
    if (availability.status === 'available') {
      throw new Error('Unavailable revocation workflow contains available health status')
    }
    return { status: 'unavailable', availability }
  }
  if (result.actionKind !== 'manual' || result.destination !== 'healthAppPermissions') {
    throw new Error('Native permission-revocation action is incomplete')
  }
  return {
    status: 'user-action-required',
    action: { kind: 'manual', destination: 'health-app-permissions' },
  }
}

function makePermissionStatusResult(
  result: NativeHealthPermissionStatusResult,
  requestedPermissions: HealthPermission[]
): HealthPermissionStatusResult {
  const availability = makeHealthAvailability(result.availability)
  if (result.statuses.length !== requestedPermissions.length) {
    throw new Error('Native permission result does not match the requested permission count')
  }
  const statuses: HealthPermissionStatusEntry[] = result.statuses.map((entry, index) => {
    const requested = requestedPermissions[index]
    if (
      requested === undefined ||
      entry.permission.accessType !== requested.accessType ||
      entry.permission.dataType !== requested.dataType
    ) {
      throw new Error(`Native permission result does not match permissions[${index}]`)
    }
    if (
      entry.status !== 'granted' &&
      entry.status !== 'notGranted' &&
      entry.status !== 'notDetermined' &&
      entry.status !== 'unverifiable'
    ) {
      throw new Error(`Unsupported native permission status at permissions[${index}]`)
    }
    return { permission: requested, status: entry.status }
  })
  if (availability.status === 'available') {
    return { status: 'available', statuses }
  }
  if (statuses.some((entry) => entry.status !== 'unverifiable')) {
    throw new Error('Unavailable permission result contains a verifiable permission status')
  }
  return {
    status: 'unavailable',
    availability,
    statuses: statuses as Array<HealthPermissionStatusEntry & { status: 'unverifiable' }>,
  }
}

export function makeHealthPermissionStatusResult(
  result: NativeHealthPermissionStatusResult,
  requestedPermissions: HealthPermission[]
): HealthPermissionStatusResult {
  return makePermissionStatusResult(result, requestedPermissions)
}

export function makeHealthAuthorizationResult(
  result: NativeHealthAuthorizationResult,
  requestedPermissions: HealthPermission[]
): HealthAuthorizationResult {
  const permissions = makePermissionStatusResult(
    {
      availability: result.availability,
      statuses: result.statuses,
    },
    requestedPermissions
  )
  if (result.status === 'completed') {
    if (permissions.status !== 'available') {
      throw new Error('Completed authorization result contains unavailable health status')
    }
    return { status: 'completed', statuses: permissions.statuses }
  }
  if (result.status !== 'unavailable') {
    throw new Error(`Unsupported native authorization status: ${result.status}`)
  }
  if (permissions.status !== 'unavailable') {
    throw new Error('Unavailable authorization result contains available health status')
  }
  return {
    status: 'unavailable',
    availability: permissions.availability,
    statuses: permissions.statuses,
  }
}

function makeKnownDeletedCount(result: NativeHealthDeleteResult): number {
  if (result.status !== 'completed' || result.deletedCountStatus !== 'known') {
    throw new Error('Identity deletion did not return an exact completed count')
  }
  if (
    result.deletedCount === undefined ||
    !Number.isSafeInteger(result.deletedCount) ||
    result.deletedCount < 0
  ) {
    throw new Error('Native deletion result has an invalid deleted count')
  }
  return result.deletedCount
}

export function makeIdentityDeleteResult(
  result: NativeHealthDeleteResult,
  requestedCount: number
): HealthIdentityDeleteResult {
  if (result.status !== 'completed') {
    throw new Error('Identity deletion returned an unsupported native status')
  }
  if (result.deletedCountStatus === 'unverifiable') {
    if (result.deletedCount !== undefined) {
      throw new Error('Unverifiable native deletion result contains a deleted count')
    }
    return {
      status: 'completed',
      requestedCount,
      deletedCount: { status: 'unverifiable' },
    }
  }

  const deletedCount = makeKnownDeletedCount(result)
  if (deletedCount === 0) {
    throw new Error('No caller-owned health records matched the supplied identities')
  }
  if (deletedCount > requestedCount) {
    throw new Error('Native deletion count exceeds the requested record count')
  }
  return {
    status: 'completed',
    requestedCount,
    deletedCount: { status: 'known', value: deletedCount },
  }
}

export function makeTimeRangeDeleteResult(
  result: NativeHealthDeleteResult
): HealthTimeRangeDeleteResult {
  if (result.status !== 'completed') {
    throw new Error('Time-range deletion returned an unsupported native status')
  }
  if (result.deletedCountStatus === 'known') {
    if (
      result.deletedCount === undefined ||
      !Number.isSafeInteger(result.deletedCount) ||
      result.deletedCount < 0
    ) {
      throw new Error('Native deletion result has an invalid deleted count')
    }
    return {
      status: 'completed',
      deletedCount: { status: 'known', value: result.deletedCount },
    }
  }

  if (result.deletedCountStatus !== 'unverifiable') {
    throw new Error(`Unsupported native deleted-count status: ${result.deletedCountStatus}`)
  }
  if (result.deletedCount !== undefined) {
    throw new Error('Unverifiable native deletion result contains a deleted count')
  }
  return {
    status: 'completed',
    deletedCount: { status: 'unverifiable' },
  }
}
