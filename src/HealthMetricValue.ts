/** Availability of one numeric workout metric. */
export type HealthMetricValue =
  | {
      /** The value was reported by the health service. */
      status: 'available'
      /** Metric value in the unit documented by its containing field. */
      value: number
    }
  | {
      /** The health service supports the metric but this record did not report it. */
      status: 'not-reported'
    }
  | {
      /** The health service cannot provide this metric for the record. */
      status: 'unsupported'
    }
