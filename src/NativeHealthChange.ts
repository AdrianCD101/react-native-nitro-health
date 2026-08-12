import type { NativeActiveEnergyBurnedSample } from './NativeActiveEnergyBurnedSample'
import type { NativeFloorsClimbedSample } from './NativeFloorsClimbedSample'
import type { NativeBasalBodyTemperatureSample } from './NativeBasalBodyTemperatureSample'
import type { NativeBloodGlucoseSample } from './NativeBloodGlucoseSample'
import type { NativeBloodPressureSample } from './NativeBloodPressureSample'
import type { NativeBodyFatSample } from './NativeBodyFatSample'
import type { NativeBodyMassSample } from './NativeBodyMassSample'
import type { NativeBodyTemperatureSample } from './NativeBodyTemperatureSample'
import type { NativeDistanceSample } from './NativeDistanceSample'
import type { NativeHeartRateSample } from './NativeHeartRateSample'
import type { NativeHeartRateVariabilitySample } from './NativeHeartRateVariabilitySample'
import type { NativeHeightSample } from './NativeHeightSample'
import type { NativeHydrationSample } from './NativeHydrationSample'
import type { NativeVo2MaxSample } from './NativeVo2MaxSample'
import type { NativeLeanBodyMassSample } from './NativeLeanBodyMassSample'
import type { NativeOxygenSaturationSample } from './NativeOxygenSaturationSample'
import type { NativeRespiratoryRateSample } from './NativeRespiratoryRateSample'
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
  /** Blood pressure samples for a `bloodPressure` upsert. */
  bloodPressureSamples?: NativeBloodPressureSample[]
  /** Blood glucose samples for a `bloodGlucose` upsert. */
  bloodGlucoseSamples?: NativeBloodGlucoseSample[]
  /** Body-temperature samples for a `bodyTemperature` upsert. */
  bodyTemperatureSamples?: NativeBodyTemperatureSample[]
  /** Respiratory-rate samples for a `respiratoryRate` upsert. */
  respiratoryRateSamples?: NativeRespiratoryRateSample[]
  /** Body-fat samples for a `bodyFat` upsert. */
  bodyFatSamples?: NativeBodyFatSample[]
  /** Lean-body-mass samples for a `leanBodyMass` upsert. */
  leanBodyMassSamples?: NativeLeanBodyMassSample[]
  /** Basal-body-temperature samples for a `basalBodyTemperature` upsert. */
  basalBodyTemperatureSamples?: NativeBasalBodyTemperatureSample[]
  /** Resting heart-rate samples for a `restingHeartRate` upsert. */
  restingHeartRateSamples?: NativeRestingHeartRateSample[]
  /** HRV samples for a `heartRateVariability` upsert. */
  heartRateVariabilitySamples?: NativeHeartRateVariabilitySample[]
  /** Distance samples for a `distance` upsert. */
  distanceSamples?: NativeDistanceSample[]
  /** Active-energy samples for an `activeEnergyBurned` upsert. */
  activeEnergyBurnedSamples?: NativeActiveEnergyBurnedSample[]
  /** Hydration samples for a `hydration` upsert. */
  hydrationSamples?: NativeHydrationSample[]
  /** Floors-climbed samples for a `floorsClimbed` upsert. */
  floorsClimbedSamples?: NativeFloorsClimbedSample[]
  /** Oxygen-saturation samples for an `oxygenSaturation` upsert. */
  oxygenSaturationSamples?: NativeOxygenSaturationSample[]
  /** Height samples for a `height` upsert. */
  heightSamples?: NativeHeightSample[]
  /** VO2 max samples for a `vo2Max` upsert. */
  vo2MaxSamples?: NativeVo2MaxSample[]
  /** Sleep intervals for a `sleep` upsert. */
  sleepSamples?: NativeSleepSample[]
  /** Body-mass samples for a `bodyMass` upsert. */
  bodyMassSamples?: NativeBodyMassSample[]
  /** Workout samples for a `workout` upsert. */
  workoutSamples?: NativeWorkoutSample[]
  /** Prevents generated C++ equality until Nitro issue #1376 is resolved. */
  dummyNonEquatable?: () => void
}
