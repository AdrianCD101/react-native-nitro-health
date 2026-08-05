import type { NativeHealthAvailability } from './NativeHealthAvailability'
import type { NativeHealthPermissionStatusEntry } from './NativeHealthPermissionStatusEntry'

export type NativeHealthAuthorizationStatus = 'completed' | 'unavailable'

/** Native authorization result shape returned by the Nitro spec. */
export interface NativeHealthAuthorizationResult {
  status: NativeHealthAuthorizationStatus
  availability: NativeHealthAvailability
  statuses: NativeHealthPermissionStatusEntry[]
}
