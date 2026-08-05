import type { HealthAvailability } from './HealthAvailability'
import type { HealthPermissionStatusEntry } from './HealthPermissionStatusEntry'

/** Public authorization result returned by {@linkcode NitroHealth.requestAuthorization}. */
export type HealthAuthorizationResult =
  | {
      /** The platform authorization workflow completed. */
      status: 'completed'
      /** One post-request status for every requested permission. */
      statuses: HealthPermissionStatusEntry[]
    }
  | {
      /** Authorization could not run because the health service was unavailable. */
      status: 'unavailable'
      /** Current unavailable health-service state. */
      availability: Exclude<HealthAvailability, { status: 'available' }>
      /** Requested permissions, each marked `unverifiable`. */
      statuses: Array<HealthPermissionStatusEntry & { status: 'unverifiable' }>
    }
