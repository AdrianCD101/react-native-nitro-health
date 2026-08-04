import type { HealthPermission } from './HealthPermission'
import type { NativeHealthPermissionStatusEntry } from './NativeHealthPermissionStatusEntry'

/** Current platform-reported state for one health permission. */
export interface HealthPermissionStatusEntry extends Omit<
  NativeHealthPermissionStatusEntry,
  'permission'
> {
  /** Permission that was inspected. */
  permission: HealthPermission
}
