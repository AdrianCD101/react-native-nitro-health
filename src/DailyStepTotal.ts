import type { StepSample } from './StepSample'

/** Daily step total bucket returned by {@linkcode NitroHealth.readDailyStepTotals}. Aggregated buckets carry no `uuid`. */
export type DailyStepTotal = Omit<StepSample, 'uuid'>
