/** Native statistics query shape passed through the Nitro spec. */
export interface NativeHealthStatisticsQuery {
  startTimeMs: number
  endTimeMs: number
  bucket: string
  metrics: string[]
  timeZone?: string
}
