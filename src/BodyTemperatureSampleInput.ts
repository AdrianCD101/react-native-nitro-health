import type { HealthWriteMetadataInput } from './HealthWriteMetadataInput'
import type { BodyTemperatureMetadata } from './BodyTemperatureMetadata'

/** Body temperature sample accepted by {@linkcode NitroHealth.saveBodyTemperature}. */
export interface BodyTemperatureSampleInput extends HealthWriteMetadataInput {
  /** Instant the reading was taken. */
  date: Date
  /** Body temperature in degrees Celsius. Must be between 20 and 45 inclusive. */
  celsius: number
  /** Platform-scoped fields retained by the native health store. */
  metadata?: BodyTemperatureMetadata
}
