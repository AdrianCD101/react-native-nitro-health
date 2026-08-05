import type {
  NativeBackgroundChangesMode,
  NativeHealthAdditionalAccessStatus,
} from './NativeHealthCapabilities'

export type NativeBackgroundChangesResultStatus = 'completed' | 'userActionRequired' | 'unavailable'

/** Native result from configuring or disabling background change delivery. */
export interface NativeBackgroundChangesResult {
  status: NativeBackgroundChangesResultStatus
  mode: NativeBackgroundChangesMode
  backgroundRead: NativeHealthAdditionalAccessStatus
}
