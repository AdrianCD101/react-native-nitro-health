import type { HealthAvailability } from './HealthAvailability'
import type { HealthPermissionStatusEntry } from './HealthPermissionStatusEntry'

/** Result returned by {@linkcode NitroHealth.getPermissionStatuses}. */
export type HealthPermissionStatusResult =
  | {
      /** The health service was available for permission inspection. */
      status: 'available'
      /** One status for each requested permission, preserving input order. */
      statuses: HealthPermissionStatusEntry[]
    }
  | {
      /** The health service was unavailable. */
      status: 'unavailable'
      /** Current unavailable health-service state. */
      availability: Exclude<HealthAvailability, { status: 'available' }>
      /** Requested permissions, each marked `unverifiable`. */
      statuses: Array<HealthPermissionStatusEntry & { status: 'unverifiable' }>
    }
