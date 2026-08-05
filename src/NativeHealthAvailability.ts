export type NativeHealthAvailabilityStatus = 'available' | 'unavailable'
export type NativeHealthAvailabilityReason =
  | 'notSupported'
  | 'serviceUnavailable'
  | 'providerInstallOrUpdateRequired'

/** Native transport for health-service availability and optional recovery. */
export interface NativeHealthAvailability {
  status: NativeHealthAvailabilityStatus
  reason?: NativeHealthAvailabilityReason
  recovery?: string
}

/** Native result from opening an availability recovery destination. */
export type NativeHealthAvailabilityRecoveryResult =
  | 'opened'
  | 'noRecoveryAction'
  | 'destinationUnavailable'
