import type { NativeActiveEnergyBurnedSample } from './NativeActiveEnergyBurnedSample'
import type { NativeBodyMassSample } from './NativeBodyMassSample'
import type { NativeDistanceSample } from './NativeDistanceSample'
import type { NativeHeartRateSample } from './NativeHeartRateSample'
import type { NativeHeartRateVariabilitySample } from './NativeHeartRateVariabilitySample'
import type { NativeHeightSample } from './NativeHeightSample'
import type { NativeOxygenSaturationSample } from './NativeOxygenSaturationSample'
import type { NativeRestingHeartRateSample } from './NativeRestingHeartRateSample'
import type { NativeSleepSample } from './NativeSleepSample'
import type { NativeStepSample } from './NativeStepSample'
import type { NativeWorkoutSample } from './NativeWorkoutSample'

/** Native transport shape for one ordered record change. */
export interface NativeHealthChange {
  /** Native change kind; either `upsert` or `delete`. */
  type: string
  /** Identifier of the native record affected by the change. */
  recordId: string
  /** Step samples for a `steps` upsert. */
  stepSamples?: NativeStepSample[]
  /** Heart-rate readings for a `heartRate` upsert. */
  heartRateSamples?: NativeHeartRateSample[]
  /** Resting heart-rate samples for a `restingHeartRate` upsert. */
  restingHeartRateSamples?: NativeRestingHeartRateSample[]
  /** HRV samples for a `heartRateVariability` upsert. */
  heartRateVariabilitySamples?: NativeHeartRateVariabilitySample[]
  /** Distance samples for a `distance` upsert. */
  distanceSamples?: NativeDistanceSample[]
  /** Active-energy samples for an `activeEnergyBurned` upsert. */
  activeEnergyBurnedSamples?: NativeActiveEnergyBurnedSample[]
  /** Oxygen-saturation samples for an `oxygenSaturation` upsert. */
  oxygenSaturationSamples?: NativeOxygenSaturationSample[]
  /** Height samples for a `height` upsert. */
  heightSamples?: NativeHeightSample[]
  /** Sleep intervals for a `sleep` upsert. */
  sleepSamples?: NativeSleepSample[]
  /** Body-mass samples for a `bodyMass` upsert. */
  bodyMassSamples?: NativeBodyMassSample[]
  /** Workout samples for a `workout` upsert. */
  workoutSamples?: NativeWorkoutSample[]
  /** Prevents generated C++ equality until Nitro issue #1376 is resolved. */
  dummyNonEquatable?: () => void
}
