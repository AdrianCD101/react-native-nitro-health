/** Recovery action offered when the health service can be installed or updated. */
export interface HealthAvailabilityRecovery {
  /** Opens the platform's provider installation or update destination. */
  kind: 'install-or-update-provider'
}

/** Health-service availability on the current device. */
export type HealthAvailability =
  | {
      /** The health service can be used. */
      status: 'available'
    }
  | {
      /** The health service cannot currently be used. */
      status: 'unavailable'
      /** Domain reason for the unavailable state. */
      reason: 'not-supported' | 'service-unavailable'
    }
  | {
      /** The health service cannot be used until its provider is installed or updated. */
      status: 'unavailable'
      /** Indicates an actionable provider installation or update. */
      reason: 'provider-install-or-update-required'
      /** Recovery action that can be passed to `performAvailabilityRecovery`. */
      recovery: HealthAvailabilityRecovery
    }

/** Result of opening an availability recovery destination. */
export type HealthAvailabilityRecoveryResult =
  | {
      /** The destination opened; installation or update still requires the user. */
      status: 'user-action-required'
      /** Destination opened for the user. */
      destination: 'provider-store'
    }
  | {
      /** The recovery destination could not be opened. */
      status: 'unavailable'
      /** Why no recovery action was opened. */
      reason: 'no-recovery-action' | 'destination-unavailable'
    }
