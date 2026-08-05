import type { BackgroundDeliveryFrequency } from './BackgroundDeliveryFrequency'
import type { HealthAvailability } from './HealthAvailability'

/** Additional access that may be required for background or historical reads. */
export type HealthAdditionalAccessStatus =
  | 'included'
  | 'unsupported'
  | 'not-declared'
  | 'not-granted'
  | 'granted'

/** Additional access workflows supported by Nitro Health. */
export type HealthAdditionalAccess = 'background-read' | 'history-read'

/** Portable background change-delivery capability. */
export type BackgroundChangesCapability =
  | {
      /** The system can wake the application through observer delivery. */
      mode: 'observer'
      /** Frequencies accepted when configuring observer delivery. */
      frequencies: readonly BackgroundDeliveryFrequency[]
      /** Separate background-read access is included in normal read authorization. */
      backgroundRead: 'included'
    }
  | {
      /** The application must periodically drain change tokens itself. */
      mode: 'polling'
      /** Scheduling is owned by the consuming application. */
      scheduling: 'app-owned'
      /** Current access for reads performed while the app is in the background. */
      backgroundRead: HealthAdditionalAccessStatus
    }

/** Runtime capabilities for platform-divergent health workflows. */
export type HealthCapabilities =
  | {
      /** System observer delivery is available. */
      backgroundChanges: Extract<BackgroundChangesCapability, { mode: 'observer' }>
      /** Historical reads are included in normal authorization. */
      historyRead: 'included'
    }
  | {
      /** The consuming application must own polling. */
      backgroundChanges: Extract<BackgroundChangesCapability, { mode: 'polling' }>
      /** Access available for reading outside the default history window. */
      historyRead: HealthAdditionalAccessStatus
    }

/** Result returned after requesting an additional access capability. */
export interface HealthAdditionalAccessResult {
  /** Capability that was inspected or requested. */
  access: HealthAdditionalAccess
  /** State observed after the request completed. */
  status: HealthAdditionalAccessStatus
}

/** Result returned when additional access cannot be inspected or requested. */
export interface UnavailableHealthAdditionalAccessResult {
  /** Capability that could not be inspected or requested. */
  access: HealthAdditionalAccess
  /** Indicates that the health service was unavailable. */
  status: 'unavailable'
  /** Current unavailable health-service state. */
  availability: HealthAvailability & { status: 'unavailable' }
}

/** Runtime capability result, including health-service unavailability. */
export type HealthCapabilitiesResult =
  | ({ status: 'available' } & HealthCapabilities)
  | {
      status: 'unavailable'
      availability: HealthAvailability & { status: 'unavailable' }
    }

/** Result of requesting optional background or historical access. */
export type RequestHealthAdditionalAccessResult =
  | HealthAdditionalAccessResult
  | UnavailableHealthAdditionalAccessResult
