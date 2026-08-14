/** Measurement location retained by {@linkcode AndroidBodyTemperatureMetadata.measurementLocation}. */
export type AndroidBodyTemperatureMeasurementLocation =
  | 'unknown'
  | 'armpit'
  | 'finger'
  | 'forehead'
  | 'mouth'
  | 'rectum'
  | 'temporal_artery'
  | 'toe'
  | 'ear'
  | 'wrist'
  | 'vagina'

/** Android fields accepted and returned through {@linkcode BodyTemperatureMetadata.android}. */
export interface AndroidBodyTemperatureMetadata {
  /** Location stored by Health Connect. Omitted writes use `unknown`. */
  measurementLocation?: AndroidBodyTemperatureMeasurementLocation
}

/** Sensor location retained by {@linkcode IOSBodyTemperatureMetadata.sensorLocation}. */
export type IOSBodyTemperatureSensorLocation =
  | 'other'
  | 'armpit'
  | 'body'
  | 'ear'
  | 'finger'
  | 'gastro_intestinal'
  | 'mouth'
  | 'rectum'
  | 'toe'
  | 'ear_drum'
  | 'temporal_artery'
  | 'forehead'

/** iOS fields accepted and returned through {@linkcode BodyTemperatureMetadata.ios}. */
export interface IOSBodyTemperatureMetadata {
  /** Location stored under HealthKit's body-temperature sensor-location metadata key. */
  sensorLocation?: IOSBodyTemperatureSensorLocation
}

/** Platform-scoped metadata used by body and basal body temperature APIs. */
export interface BodyTemperatureMetadata {
  /** Health Connect body-temperature fields. */
  android?: AndroidBodyTemperatureMetadata
  /** HealthKit body-temperature fields. */
  ios?: IOSBodyTemperatureMetadata
}
