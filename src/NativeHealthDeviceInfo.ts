/** Native transport for physical device provenance on health sample reads and writes. */
export interface NativeHealthDeviceInfo {
  type?: NativeHealthDeviceType
  manufacturer?: string
  model?: string
}

export type NativeHealthDeviceType =
  | 'unknown'
  | 'watch'
  | 'phone'
  | 'scale'
  | 'ring'
  | 'headMounted'
  | 'fitnessBand'
  | 'chestStrap'
  | 'smartDisplay'
