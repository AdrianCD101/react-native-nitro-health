import type { HealthWriteMetadataInput } from './HealthWriteMetadataInput'
import type { BodyTemperatureMetadata } from './BodyTemperatureMetadata'

/** Basal body temperature sample accepted by {@linkcode NitroHealth.saveBasalBodyTemperature}. */
export interface BasalBodyTemperatureSampleInput extends HealthWriteMetadataInput {
  /** Instant the reading was taken. */
  date: Date
  /** Basal body temperature in degrees Celsius. Must be between 20 and 45 inclusive. */
  celsius: number
  /** Platform-scoped fields retained by the native health store. */
  metadata?: BodyTemperatureMetadata
}
