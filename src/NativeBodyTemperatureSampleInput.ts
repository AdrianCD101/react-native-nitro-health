/** Native body temperature sample input shape passed through the Nitro spec. */
export interface NativeBodyTemperatureSampleInput {
  timeMs: number
  celsius: number
  syncId?: string
  syncVersion?: number
}
