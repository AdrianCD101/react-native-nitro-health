import type { HealthDataType } from './HealthDataType'
import type { HealthPermissionAccessType } from './HealthPermissionAccessType'
import type { NativeHealthPermission } from './NativeHealthPermission'
/** Permission requested through {@linkcode NitroHealth.requestAuthorization}. */
export interface HealthPermission extends NativeHealthPermission {
  /** Whether the app wants to read or write the health data type. */
  accessType: HealthPermissionAccessType
  /** Health data type to authorize. */
  dataType: HealthDataType
}
