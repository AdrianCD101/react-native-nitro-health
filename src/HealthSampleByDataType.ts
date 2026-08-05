import type { ActiveEnergyBurnedSample } from './ActiveEnergyBurnedSample'
import type { BloodPressureSample } from './BloodPressureSample'
import type { BodyMassSample } from './BodyMassSample'
import type { DistanceSample } from './DistanceSample'
import type { HeartRateSample } from './HeartRateSample'
import type { HeartRateVariabilitySample } from './HeartRateVariabilitySample'
import type { HeightSample } from './HeightSample'
import type { OxygenSaturationSample } from './OxygenSaturationSample'
import type { RestingHeartRateSample } from './RestingHeartRateSample'
import type { SleepSample } from './SleepSample'
import type { StepSample } from './StepSample'
import type { WorkoutSample } from './WorkoutSample'

/** Maps each health data type to the sample returned by reads and change tracking. */
export interface HealthSampleByDataType {
  /** Step count intervals. */
  steps: StepSample
  /** Individual heart-rate readings. */
  heartRate: HeartRateSample
  /** Blood pressure readings. */
  bloodPressure: BloodPressureSample
  /** Resting heart-rate readings. */
  restingHeartRate: RestingHeartRateSample
  /** Platform-specific heart-rate variability readings. */
  heartRateVariability: HeartRateVariabilitySample
  /** Distance intervals. */
  distance: DistanceSample
  /** Active-energy intervals. */
  activeEnergyBurned: ActiveEnergyBurnedSample
  /** Oxygen-saturation readings. */
  oxygenSaturation: OxygenSaturationSample
  /** Height measurements. */
  height: HeightSample
  /** Tagged sleep session envelopes and stage intervals. */
  sleep: SleepSample
  /** Body-mass measurements. */
  bodyMass: BodyMassSample
  /** Workout sessions. */
  workout: WorkoutSample
}
