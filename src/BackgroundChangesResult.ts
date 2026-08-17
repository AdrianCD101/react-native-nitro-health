import type { HealthAdditionalAccessStatus } from './HealthCapabilities'
import type { HealthAvailability } from './HealthAvailability'
import type { ChangeTrackedHealthDataType } from './HealthDataType'
import type { ListenerSubscription } from './ListenerSubscription'

/** Result of configuring or disabling background change delivery. */
export type BackgroundChangesConfigurationResult =
  | {
      /** Observer delivery was configured or disabled directly. */
      status: 'completed'
      /** Delivery mechanism used by the platform. */
      mode: 'observer'
    }
  | {
      /** The app must configure or cancel its own polling schedule. */
      status: 'user-action-required'
      /** Delivery mechanism used by the platform. */
      mode: 'polling'
      /** Scheduling owner. */
      scheduling: 'app-owned'
      /** Background-read access available to app-owned work. */
      backgroundRead: HealthAdditionalAccessStatus
    }
  | {
      /** Background changes cannot be configured while health data is unavailable. */
      status: 'unavailable'
    }

/** Result of subscribing to background change hints. */
export type BackgroundChangesSubscriptionResult =
  | {
      /** System observer hints will be delivered to the listener. */
      mode: 'observer'
      /** Removes this listener. */
      subscription: ListenerSubscription
    }
  | {
      /** No observer exists; the application must schedule token drains itself. */
      mode: 'polling'
      /** Scheduling owner. */
      scheduling: 'app-owned'
    }
  | {
      /** Background change delivery cannot be used while the health service is unavailable. */
      mode: 'unavailable'
      /** Current unavailable health-service state. */
      availability: HealthAvailability & { status: 'unavailable' }
    }

/** Requested background observer configuration. */
export interface BackgroundChangesConfiguration {
  /** Data types whose change tokens should be drained after a delivery hint. */
  dataTypes: ChangeTrackedHealthDataType[]
  /** Preferred observer-delivery frequency. */
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly'
}
