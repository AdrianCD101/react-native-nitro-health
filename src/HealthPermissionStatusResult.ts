import type { HealthPermissionStatusEntry } from './HealthPermissionStatusEntry'
import type { NativeHealthPermissionStatusResult } from './NativeHealthPermissionStatusResult'

/** Result returned by {@linkcode NitroHealth.getPermissionStatuses}. */
export interface HealthPermissionStatusResult extends Omit<
  NativeHealthPermissionStatusResult,
  'statuses'
> {
  /** One status for each requested permission, preserving input order. */
  statuses: HealthPermissionStatusEntry[]
}
