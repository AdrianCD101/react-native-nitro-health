/**
 * Describes how a {@linkcode !HealthSample} was captured.
 *
 * Save inputs such as {@linkcode !StepSampleInput} can request a method, while read samples
 * report the method retained by the native health service. `unknown` means the service did
 * not expose a more specific method. `manual` identifies user-entered data,
 * `actively-recorded` identifies user-initiated capture, and `automatically-recorded`
 * identifies passive capture.
 */
export type HealthRecordingMethod =
  | 'manual'
  | 'actively-recorded'
  | 'automatically-recorded'
  | 'unknown'
