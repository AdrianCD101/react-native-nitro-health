import type { ActiveEnergyBurnedSample } from './ActiveEnergyBurnedSample'
import type { BasalBodyTemperatureSample } from './BasalBodyTemperatureSample'
import type { BloodGlucoseSample } from './BloodGlucoseSample'
import type { BloodPressureSample } from './BloodPressureSample'
import type { BodyFatSample } from './BodyFatSample'
import type { BodyMassSample } from './BodyMassSample'
import type { BodyTemperatureSample } from './BodyTemperatureSample'
import type { DistanceSample } from './DistanceSample'
import type { HeartRateSample } from './HeartRateSample'
import type { HeartRateVariabilitySample } from './HeartRateVariabilitySample'
import type { FloorsClimbedSample } from './FloorsClimbedSample'
import type { HeightSample } from './HeightSample'
import type { HydrationSample } from './HydrationSample'
import type { Vo2MaxSample } from './Vo2MaxSample'
import type { LeanBodyMassSample } from './LeanBodyMassSample'
import type { OxygenSaturationSample } from './OxygenSaturationSample'
import type { RespiratoryRateSample } from './RespiratoryRateSample'
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
  /** Blood glucose readings. */
  bloodGlucose: BloodGlucoseSample
  /** Body-temperature readings. */
  bodyTemperature: BodyTemperatureSample
  /** Respiratory-rate readings. */
  respiratoryRate: RespiratoryRateSample
  /** Body-fat percentage readings. */
  bodyFat: BodyFatSample
  /** Lean-body-mass measurements. */
  leanBodyMass: LeanBodyMassSample
  /** Basal-body-temperature readings. */
  basalBodyTemperature: BasalBodyTemperatureSample
  /** Resting heart-rate readings. */
  restingHeartRate: RestingHeartRateSample
  /** Platform-specific heart-rate variability readings. */
  heartRateVariability: HeartRateVariabilitySample
  /** Distance intervals. */
  distance: DistanceSample
  /** Active-energy intervals. */
  activeEnergyBurned: ActiveEnergyBurnedSample
  /** Hydration intervals. */
  hydration: HydrationSample
  /** Floors climbed intervals. */
  floorsClimbed: FloorsClimbedSample
  /** Oxygen-saturation readings. */
  oxygenSaturation: OxygenSaturationSample
  /** Height measurements. */
  height: HeightSample
  /** VO2 max readings. */
  vo2Max: Vo2MaxSample
  /** Tagged sleep session envelopes and stage intervals. */
  sleep: SleepSample
  /** Body-mass measurements. */
  bodyMass: BodyMassSample
  /** Workout sessions. */
  workout: WorkoutSample
}
