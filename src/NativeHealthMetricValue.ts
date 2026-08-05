export type NativeHealthMetricValueStatus = 'available' | 'notReported' | 'unsupported'

/** Native transport for an available, absent, or unsupported numeric metric. */
export interface NativeHealthMetricValue {
  status: NativeHealthMetricValueStatus
  value?: number
}
