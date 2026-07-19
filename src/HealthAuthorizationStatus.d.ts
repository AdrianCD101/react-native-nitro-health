/** Aggregate outcome returned by {@linkcode NitroHealth.requestAuthorization}. */
export type HealthAuthorizationStatus =
  | 'granted'
  | 'partial'
  | 'denied'
  | 'completed'
  | 'unavailable'
