/** Normalized sleep stage returned by {@linkcode NitroHealth.readSleepSamples}. */
export type SleepStage =
  | 'inBed'
  | 'awake'
  | 'awakeInBed'
  | 'asleep'
  | 'asleepCore'
  | 'asleepDeep'
  | 'asleepREM'
  | 'outOfBed'
  | 'unknown'
