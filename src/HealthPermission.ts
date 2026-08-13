import type { HealthPermissionDataType, WritableHealthDataType } from './HealthDataType'
import type { HealthPermissionAccessType } from './HealthPermissionAccessType'

/** Permission requested through {@linkcode NitroHealth.requestAuthorization}. */
export type HealthPermission =
  | {
      /** Requests read access. */
      accessType: Extract<HealthPermissionAccessType, 'read'>
      /** Health data type to read, including aggregate-only energy concepts. */
      dataType: HealthPermissionDataType
    }
  | {
      /** Requests write access. */
      accessType: Extract<HealthPermissionAccessType, 'write'>
      /** Writable health data type. HRV is read-only because platform metrics differ. */
      dataType: WritableHealthDataType
    }
