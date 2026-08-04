import type { HealthAvailabilityStatus } from './HealthAvailabilityStatus'
import type { NativeHealthPermissionStatusEntry } from './NativeHealthPermissionStatusEntry'

/** Native permission introspection result returned by the Nitro spec. */
export interface NativeHealthPermissionStatusResult {
  /** Platform health API availability observed during the query. */
  availabilityStatus: HealthAvailabilityStatus
  /** One status for each requested permission, preserving input order. */
  statuses: NativeHealthPermissionStatusEntry[]
}
