import type { HealthDataType } from './HealthDataType'
import type { DistanceStatistics, HealthStatistics } from './HealthStatistics'

/** Statistics result associated with a health data type. */
export type HealthStatisticsByDataType<T extends HealthDataType> = T extends 'distance'
  ? DistanceStatistics
  : HealthStatistics
