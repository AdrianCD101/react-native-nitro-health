import type { HealthPermissionStatus } from './HealthPermissionStatus'
import type { NativeHealthPermission } from './NativeHealthPermission'

/** Native status entry returned by the Nitro spec. */
export interface NativeHealthPermissionStatusEntry {
  /** Permission that was inspected. */
  permission: NativeHealthPermission
  /** Current state the platform can report for the permission. */
  status: HealthPermissionStatus
}
