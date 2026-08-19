/** Normalized sleep stage returned by {@linkcode NitroHealth.readSleepSamples}. */
export type SleepStage =
  | 'awake'
  | 'awakeInBed'
  | 'asleep'
  | 'asleepCore'
  | 'asleepDeep'
  | 'asleepREM'
  | 'outOfBed'
  | 'unknown'
