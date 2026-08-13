import type { HealthStatisticsDataType } from './HealthDataType'
import type { DistanceStatistics, HealthStatistics } from './HealthStatistics'

/** Statistics result associated with a health data type. */
export type HealthStatisticsByDataType<T extends HealthStatisticsDataType> = T extends 'distance'
  ? DistanceStatistics
  : HealthStatistics
