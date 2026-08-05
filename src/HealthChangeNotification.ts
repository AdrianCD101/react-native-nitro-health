import type { HealthDataType } from './HealthDataType'
import type { NitroHealth } from './NitroHealth'

/**
 * Coalesced hint that one or more health data types may have changed.
 *
 * @see {@linkcode NitroHealth.subscribeToBackgroundChanges}
 */
export interface HealthChangeNotification {
  /** Data types whose durable change feeds should be drained. */
  readonly dataTypes: readonly HealthDataType[]
}
