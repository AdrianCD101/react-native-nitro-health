/** Test protocol retained by {@linkcode AndroidVo2MaxMetadata.measurementMethod}. */
export type AndroidVo2MaxMeasurementMethod =
  | 'other'
  | 'metabolic_cart'
  | 'heart_rate_ratio'
  | 'cooper_test'
  | 'multistage_fitness_test'
  | 'rockport_fitness_test'

/** Android fields accepted and returned through {@linkcode Vo2MaxMetadata.android}. */
export interface AndroidVo2MaxMetadata {
  /** Test protocol stored by Health Connect. Omitted writes use `other`. */
  measurementMethod?: AndroidVo2MaxMeasurementMethod
}

/** Measurement class retained by {@linkcode IOSVo2MaxMetadata.testType}. */
export type IOSVo2MaxTestType =
  | 'max_exercise'
  | 'prediction_sub_max_exercise'
  | 'prediction_non_exercise'
  | 'prediction_step_test'

/** iOS fields accepted and returned through {@linkcode Vo2MaxMetadata.ios}. */
export interface IOSVo2MaxMetadata {
  /**
   * Measurement class stored under HealthKit's VO2 max test-type metadata key.
   * Writing `prediction_step_test` requires iOS 26 or later.
   */
  testType?: IOSVo2MaxTestType
}

/** Platform-scoped metadata used by VO2 max read and write APIs. */
export interface Vo2MaxMetadata {
  /** Health Connect VO2 max fields. */
  android?: AndroidVo2MaxMetadata
  /** HealthKit VO2 max fields. */
  ios?: IOSVo2MaxMetadata
}
