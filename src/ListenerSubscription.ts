/**
 * Owns cleanup for one listener registration.
 *
 * @see {@linkcode NitroHealth.subscribeToBackgroundChanges}
 */
export interface ListenerSubscription {
  /** Removes the listener. Repeated calls have no effect. */
  remove(): void
}
import type { NitroHealth } from './NitroHealth'
