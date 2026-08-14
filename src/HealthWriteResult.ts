import type { HealthRecordingMethod } from './HealthRecordingMethod'

/**
 * Result returned by non-distance writes such as {@linkcode !NitroHealth.saveSteps}.
 */
export interface HealthWriteResult {
  /** The samples were stored. */
  status: 'completed'
  /**
   * Recording methods retained by the native health service, aligned by top-level input
   * index. On iOS, `actively-recorded` and `automatically-recorded` degrade to `unknown`.
   * Versioned writes read the retained record back when read access is available; with
   * write-only access, the result reports the platform-normalized submitted method.
   *
   * @see {@linkcode HealthRecordingMethod}
   */
  storedRecordingMethods: HealthRecordingMethod[]
}
