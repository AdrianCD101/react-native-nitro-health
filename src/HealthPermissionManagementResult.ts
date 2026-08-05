import type { HealthAvailability } from './HealthAvailability'

/** Manual action needed to manage health permissions. */
export type HealthPermissionAction =
  | {
      /** A system permission destination was opened. */
      kind: 'opened'
      /** Destination opened for permission management. */
      destination: 'health-connect-settings'
    }
  | {
      /** The user must navigate to the Health app manually. */
      kind: 'manual'
      /** Stable destination consumers can explain in localized UI. */
      destination: 'health-app-permissions'
    }

/** Result of asking the system to present health permission management. */
export type HealthPermissionManagementResult =
  | {
      /** Permission changes still require the user. */
      status: 'user-action-required'
      /** Direct or manual action available to the user. */
      action: HealthPermissionAction
    }
  | {
      /** Permission management is unavailable because the health service is unavailable. */
      status: 'unavailable'
      /** Current unavailable health-service state. */
      availability: Exclude<HealthAvailability, { status: 'available' }>
    }

/** Result of revoking every health permission granted to the application. */
export type HealthPermissionRevocationResult =
  | {
      /** Revocation completed directly. */
      status: 'completed'
    }
  | {
      /** Revocation requires the user to act in a system application. */
      status: 'user-action-required'
      /** Manual permission-management action. */
      action: Extract<HealthPermissionAction, { kind: 'manual' }>
    }
  | {
      /** Revocation is unavailable because the health service is unavailable. */
      status: 'unavailable'
      /** Current unavailable health-service state. */
      availability: Exclude<HealthAvailability, { status: 'available' }>
    }
