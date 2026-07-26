import type { DistanceSample } from './DistanceSample'

/** Daily distance total bucket returned by {@linkcode NitroHealth.readDailyDistanceTotals}. Aggregated buckets carry no `uuid`. */
export type DailyDistanceTotal = Omit<DistanceSample, 'uuid'>
