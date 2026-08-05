import type { HealthPermission } from './HealthPermission'
import type { HealthPermissionStatus } from './HealthPermissionStatus'

/** Current platform-reported state for one health permission. */
export interface HealthPermissionStatusEntry {
  /** Permission that was inspected. */
  permission: HealthPermission
  /** Current state the platform can report for the permission. */
  status: HealthPermissionStatus
}
