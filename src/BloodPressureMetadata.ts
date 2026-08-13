/** Body position retained by {@linkcode AndroidBloodPressureMetadata.bodyPosition}. */
export type AndroidBloodPressureBodyPosition =
  | 'unknown'
  | 'standing_up'
  | 'sitting_down'
  | 'lying_down'
  | 'reclining'

/** Measurement location retained by {@linkcode AndroidBloodPressureMetadata.measurementLocation}. */
export type AndroidBloodPressureMeasurementLocation =
  | 'unknown'
  | 'left_wrist'
  | 'right_wrist'
  | 'left_upper_arm'
  | 'right_upper_arm'

/** Android-only fields accepted and returned through {@linkcode BloodPressureMetadata.android}. */
export interface AndroidBloodPressureMetadata {
  /** Body position during the reading. Omitted writes use `unknown`. */
  bodyPosition?: AndroidBloodPressureBodyPosition
  /** Cuff or device location during the reading. Omitted writes use `unknown`. */
  measurementLocation?: AndroidBloodPressureMeasurementLocation
}

/** Platform-scoped metadata used by blood pressure read and write APIs. */
export interface BloodPressureMetadata {
  /** Health Connect fields with no HealthKit counterpart. */
  android?: AndroidBloodPressureMetadata
}
