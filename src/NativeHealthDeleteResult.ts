export type NativeHealthDeleteStatus = 'completed' | 'notFoundOrNotOwned'
export type NativeDeletedCountStatus = 'known' | 'unverifiable'

/** Native aggregate deletion outcome. */
export interface NativeHealthDeleteResult {
  status: NativeHealthDeleteStatus
  deletedCountStatus: NativeDeletedCountStatus
  deletedCount?: number
}
