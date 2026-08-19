import type { HealthSample } from './HealthSample'
import type { SleepStage } from './SleepStage'

/** Sleep-session envelope returned by {@linkcode NitroHealth.readSleepSamples}. */
export interface SleepSessionEnvelope extends HealthSample {
  /** Identifies this interval as a session envelope rather than a stage. */
  kind: 'session-envelope'
  /** Start of the sleep session. */
  startDate: Date
  /** End of the sleep session. */
  endDate: Date
  /**
   * Whether explicit stage detail exists for this envelope. Always
   * `not-reported` on iOS: HealthKit does not link stage samples to the
   * in-bed interval they belong to.
   */
  stageData: 'reported' | 'not-reported'
}

/** Explicit sleep-stage interval returned by {@linkcode NitroHealth.readSleepSamples}. */
export interface SleepStageSample extends HealthSample {
  /** Identifies this interval as an explicit sleep stage. */
  kind: 'stage'
  /** Start of the sleep interval. */
  startDate: Date
  /** End of the sleep interval. */
  endDate: Date
  /** Normalized sleep stage for this interval. */
  stage: SleepStage
}

/** Tagged sleep record that preserves session envelopes and explicit stages. */
export type SleepSample = SleepSessionEnvelope | SleepStageSample
