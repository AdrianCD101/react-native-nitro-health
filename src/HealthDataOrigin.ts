/** Application that originally recorded a health sample. */
export interface HealthDataOrigin {
  /** Stable application identifier, such as a bundle identifier or package name. */
  identifier: string
  /** Human-readable application name when the health service provides one. */
  displayName?: string
}
