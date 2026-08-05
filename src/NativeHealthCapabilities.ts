/** Native status for separately authorized background or historical reads. */
export type NativeHealthAdditionalAccessStatus =
  | 'included'
  | 'unsupported'
  | 'notDeclared'
  | 'notGranted'
  | 'granted'
export type NativeBackgroundChangesMode = 'observer' | 'polling'

/** Native runtime capability result. */
export interface NativeHealthCapabilities {
  backgroundChangesMode: NativeBackgroundChangesMode
  backgroundRead: NativeHealthAdditionalAccessStatus
  historyRead: NativeHealthAdditionalAccessStatus
}
