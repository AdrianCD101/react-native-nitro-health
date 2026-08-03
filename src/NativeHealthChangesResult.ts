import type { NativeHealthChange } from './NativeHealthChange'

/** Native transport shape returned by the platform changes implementation. */
export interface NativeHealthChangesResult {
  /** Ordered native record changes. */
  changes: NativeHealthChange[]
  /** Wrapped native checkpoint, absent only when the input token expired. */
  nextChangesToken?: string
  /** Whether another page should be requested immediately. */
  hasMore: boolean
  /** Whether the input checkpoint can no longer be used. */
  tokenExpired: boolean
}
