/** Portable recording-device provenance returned by {@linkcode !HealthSample.device} and accepted by write inputs. */
export interface HealthDeviceInfo {
  /** Portable device category when known. */
  type?: HealthDeviceType
  /** Device manufacturer when known. */
  manufacturer?: string
  /** Device model when known. */
  model?: string
}

/** Portable categories reported by {@linkcode HealthDeviceInfo.type}. */
export type HealthDeviceType =
  | 'unknown'
  | 'watch'
  | 'phone'
  | 'scale'
  | 'ring'
  | 'head-mounted'
  | 'fitness-band'
  | 'chest-strap'
  | 'smart-display'
