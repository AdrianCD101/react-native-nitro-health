/**
 * Android Health Connect background-read authorization state.
 *
 * @see {@linkcode NitroHealth.getBackgroundReadAuthorizationStatus}
 */
export type BackgroundReadAuthorizationStatus =
  | 'unavailable'
  | 'notDeclared'
  | 'notGranted'
  | 'granted'
