/** Native basal body temperature sample input shape passed through the Nitro spec. */
export interface NativeBasalBodyTemperatureSampleInput {
  timeMs: number
  celsius: number
  syncId?: string
  syncVersion?: number
}
