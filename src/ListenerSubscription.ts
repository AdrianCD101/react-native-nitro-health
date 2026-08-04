/**
 * Owns cleanup for one listener registration.
 *
 * @see {@linkcode NitroHealth.addOnChangeNotificationListener}
 */
export interface ListenerSubscription {
  /** Removes the listener. Repeated calls have no effect. */
  remove(): void
}
