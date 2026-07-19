import type { AuthorizationRequestStatus } from './AuthorizationRequestStatus'
import type { HealthAuthorizationStatus } from './HealthAuthorizationStatus'
import type { HealthAvailabilityStatus } from './HealthAvailabilityStatus'
import type { NativeHealthPermission } from './NativeHealthPermission'
/** Native authorization result shape returned by the Nitro spec. */
export interface NativeHealthAuthorizationResult {
  /** Aggregate authorization outcome for the requested permissions. */
  status: HealthAuthorizationStatus
  /** Platform health API availability observed during the request. */
  availabilityStatus: HealthAvailabilityStatus
  /** Whether the platform thinks another permission prompt is needed. */
  requestStatus: AuthorizationRequestStatus
  /** Permissions the platform reports as granted after the request. */
  grantedPermissions: NativeHealthPermission[]
  /** Permissions the platform reports as denied after the request. */
  deniedPermissions: NativeHealthPermission[]
  /** Permissions whose grant state cannot be verified by the platform. */
  unverifiablePermissions: NativeHealthPermission[]
}
