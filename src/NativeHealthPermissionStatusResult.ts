import type { NativeHealthAvailability } from './NativeHealthAvailability'
import type { NativeHealthPermissionStatusEntry } from './NativeHealthPermissionStatusEntry'

/** Native permission introspection result returned by the Nitro spec. */
export interface NativeHealthPermissionStatusResult {
  /** Platform health API availability observed during the query. */
  availability: NativeHealthAvailability
  /** One status for each requested permission, preserving input order. */
  statuses: NativeHealthPermissionStatusEntry[]
}
