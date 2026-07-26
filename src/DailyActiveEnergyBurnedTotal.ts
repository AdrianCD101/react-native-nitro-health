import type { ActiveEnergyBurnedSample } from './ActiveEnergyBurnedSample'

/** Daily active-energy total bucket returned by {@linkcode NitroHealth.readDailyActiveEnergyBurnedTotals}. Aggregated buckets carry no `uuid`. */
export type DailyActiveEnergyBurnedTotal = Omit<ActiveEnergyBurnedSample, 'uuid'>
